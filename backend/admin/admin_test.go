package admin_test

import (
	"bytes"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"

	"example.com/main/routes"
	"example.com/main/utils"
	"github.com/gin-gonic/gin"
)

type TestingStructure struct {
	name         string
	reqbody      string
	prior        []string
	cleanup      []string
	token        string
	expectedCode int
}

func tokenSetter(tokentype string) string {
	if tokentype == "valid" {
		return `token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVaWQiOiJBMSIsIlJvbGUiOiJhZG1pbiIsImV4cCI6MTc2NDMzMjUyMSwiaWF0IjoxNzY0MjQ2MTIxfQ.uws7721EbSn41HbLOF1dduPNssuHSLt0VFfaMac3xgE"`
	} else {
		return `token="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp.eyJVaWQiOiJBMiJhZG1pbiIsImV4cCI6MTc2NDMzMjUyMSwiaWF0IjoxNzY0MjQ2MTIxfQ.uws7721EbSn41HbLOF1dduPNssuHSLt0VF"`
	}
}

func TestAddStudentsByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "Invalid grNo",
			reqbody:      `{"grNo":1399999999,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":5,"section":"A"}`,
			cleanup:      []string{""},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid section",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":5,"section":"A1"}`,
			cleanup:      []string{""},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid std",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":15,"section":"A"}`,
			cleanup:      []string{""},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid pwd",
			reqbody:      `{"grNo":14,"studPwd":"Asd","userRole":"student","studName":"raj","std":5,"section":"A"}`,
			cleanup:      []string{""},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid student name",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj6","std":5,"section":"A"}`,
			cleanup:      []string{""},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid role",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"admin","studName":"raj","std":5,"section":"A"}`,
			cleanup:      []string{""},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"grNo": 101,"studPwd": "pass123","userRole": "student","studName": "John Doe","std": 10,"section": "A"}`,
			cleanup:      []string{""},
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":8,"section":"A"}`,
			cleanup:      []string{"DELETE FROM students WHERE grNo=14"},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case",
			reqbody:      `{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":8,"section":"B"}`,
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusOK,
		},
		{
			name:         "student already exists",
			prior:        []string{`INSERT INTO students VALUES (15, "Asdf123@", "student", "raju", 8, "B")`},
			reqbody:      `{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`,
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusBadRequest,
		},
	}

	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/admin/createStud", bytes.NewBufferString(tc.reqbody))
			if err != nil {
				t.Fatalf("failed to create request: %v", err)
			}
			req.Header.Set("Content-Type", "application/json")
			ctx.Request = req
			if tc.name == "authorization fail" {
				tc.token = tokenSetter("invalid")
			} else {
				tc.token = tokenSetter("valid")
			}
			req.Header.Set("Cookie", tc.token)
			router.ServeHTTP(w, req)
			if w.Code != tc.expectedCode {
				t.Errorf("%s in this test - expected status %d, got %d", tc.name, tc.expectedCode, w.Code)
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			utils.Cleaner(tc.cleanup)
		})
	}
}

func TestEditStudentsByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "Invalid grNo",
			reqbody:      `{"grNo":1399999999,"studPwd":"Asdf1234"`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid section",
			prior:        []string{`INSERT INTO students VALUES (15, "Asdf123@", "student", "raju", 8, "B")`},
			reqbody:      `{"grNo":15,"section":"A1"}`,
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid std",
			prior:        []string{`INSERT INTO students VALUES (15, "Asdf123@", "student", "raju", 8, "B")`},
			reqbody:      `{"grNo":15,"std":15}`,
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid pwd",
			prior:        []string{`INSERT INTO students VALUES (15, "Asdf123@", "student", "raju", 8, "B")`},
			reqbody:      `{"grNo":15,"studPwd":"Asd"}`,
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid student name",
			prior:        []string{`INSERT INTO students VALUES (15, "Asdf123@", "student", "raju", 8, "B")`},
			reqbody:      `{"grNo":15,"studName":"raj6"}`,
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "student doesnot exists",
			reqbody: `{"grNo":100001,"studPwd":"Asdf123@"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"grNo": 1,"studPwd": "pas01234"}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "old and new value same",
			reqbody:      `{"grNo":15"studName":"raju"}`,
			prior:        []string{`INSERT INTO students VALUES (15, "Asdf123@", "student", "raju", 8, "B")`},
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Valid case",
			prior:        []string{`INSERT INTO students VALUES (15, "Asdf123@", "student", "raju", 8, "B")`},
			reqbody:      `{"grNo":15,"studName":"ramu"}`,
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusOK,
		},
	}
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPut, "/admin/updateStud", bytes.NewBufferString(tc.reqbody))
			if err != nil {
				t.Fatalf("failed to create request: %v", err)
			}
			req.Header.Set("Content-Type", "application/json")
			if tc.name == "authorization fail" {
				tc.token = tokenSetter("invalid")
			} else {
				tc.token = tokenSetter("valid")
			}
			req.Header.Set("Cookie", tc.token)
			ctx.Request = req
			router.ServeHTTP(w, req)
			if w.Code != tc.expectedCode {
				t.Errorf("%s in this test - expected status %d, got %d", tc.name, tc.expectedCode, w.Code)
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			utils.Cleaner(tc.cleanup)
		})
	}
}

func TestAddSubjectByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "Invalid subid",
			reqbody:      `{"subId":1399999999,"subName":"math","levelStd":5,"credits":5}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid std",
			reqbody:      `{"subId":125,"subName":"english","levelStd":15,"credits":5}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid credits",
			reqbody:      `{"subId":100,"subName":"english","levelStd":5,"credits":-5}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid name",
			reqbody:      `{"subId":100,"subName":"mathffskbdibcisdhcksbckdsbcsdbcisdbcisdicvsdicbidscibdsicbicbidbcidbiddsckbbsvvsuvsvsbuksabdsyuc","levelStd":5,"credits":5}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "unset subject limit",
			reqbody:      `{"subId":100,"subName":"eng 2","levelStd":12,"credits":5}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"subId":9999,"subName":"maths 2","levelStd":12,"credits":5}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			prior:        []string{"INSERT INTO subjectAllocation VALUES (12,5)"},
			reqbody:      `{"subId":125,"subName":"english","levelStd":12,"credits":5}`,
			cleanup:      []string{"DELETE FROM subjects WHERE subId=125", "DELETE FROM subjectAllocation WHERE std=12"},
			expectedCode: http.StatusOK,
		},
	}

	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				fmt.Println("running prior", tc.prior)
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/admin/createSub", bytes.NewBufferString(tc.reqbody))
			if err != nil {
				t.Fatalf("failed to create request: %v", err)
			}
			req.Header.Set("Content-Type", "application/json")
			ctx.Request = req
			if tc.name == "authorization fail" {
				tc.token = tokenSetter("invalid")
			} else {
				tc.token = tokenSetter("valid")
			}
			req.Header.Set("Cookie", tc.token)
			router.ServeHTTP(w, req)
			if w.Code != tc.expectedCode {
				t.Errorf("%s in this test - expected status %d, got %d", tc.name, tc.expectedCode, w.Code)
				utils.Cleaner(tc.cleanup)
				return
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			utils.Cleaner(tc.cleanup)
		})
	}
}
