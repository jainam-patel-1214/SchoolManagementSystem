package student_test

import (
	"bytes"
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
		return `token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVaWQiOiIxIiwiUm9sZSI6InN0dWRlbnQiLCJleHAiOjE3NjQ2NjQ3NjUsImlhdCI6MTc2NDU3ODM2NX0.f36BFYvv2vd2f6F0HAQ9tZvrHshBt9sPt1kngPj0w9s"`
	} else {
		return `token="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp.eyJVaWQiOiJBMiJhZG1pbiIsImV4cCI6MTc2NDMzMjUyMSwiaWF0IjoxNzY0MjQ2MTIxfQ.uws7721EbSn41HbLOF1dduPNssuHSLt0VF"`
	}
}

func TestDisplayStudents(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "Valid case",
			reqbody:      `?viewByStd=3`,
			prior:        []string{`INSERT INTO students VALUES (1221,"password","student","selmonone",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",3,15)`, `INSERT INTO marks VALUES (1221,141,80,20,"AA")`, `INSERT INTO students VALUES (1222,"password","student","selmontwo",3,"A")`, `INSERT INTO subjects VALUES (145,"SANSKRIT",3,10)`, `INSERT INTO marks VALUES (1222,145,80,20,"AA")`, `INSERT INTO marks VALUES (1221,145,80,20,"AA")`, `INSERT INTO students VALUES (1223,"password","student","selmonthree",3,"A")`, `INSERT INTO marks VALUES (1223,141,25,20,"CD")`, `INSERT INTO students VALUES (1224,"password","student","selmonfour",3,"A")`, `INSERT INTO marks VALUES (1224,141,20,20,"DD")`},
			cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM students WHERE grNo=1222`, `DELETE FROM students WHERE grNo=1223`, `DELETE FROM students WHERE grNo=1224`, `DELETE FROM subjects WHERE subId=141`, `DELETE FROM subjects WHERE subId=145`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case",
			reqbody:      `?viewByStd=3&maxPercent=50&minPercent=20`,
			prior:        []string{`INSERT INTO students VALUES (1221,"password","student","selmonone",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",3,15)`, `INSERT INTO marks VALUES (1221,141,80,20,"AA")`, `INSERT INTO students VALUES (1222,"password","student","selmontwo",3,"A")`, `INSERT INTO subjects VALUES (145,"SANSKRIT",3,10)`, `INSERT INTO marks VALUES (1222,145,80,20,"AA")`, `INSERT INTO marks VALUES (1221,145,80,20,"AA")`, `INSERT INTO students VALUES (1223,"password","student","selmonthree",3,"A")`, `INSERT INTO marks VALUES (1223,141,25,20,"CD")`, `INSERT INTO students VALUES (1224,"password","student","selmonfour",3,"A")`, `INSERT INTO marks VALUES (1224,141,20,20,"DD")`},
			cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM students WHERE grNo=1222`, `DELETE FROM students WHERE grNo=1223`, `DELETE FROM students WHERE grNo=1224`, `DELETE FROM subjects WHERE subId=141`, `DELETE FROM subjects WHERE subId=145`},
			expectedCode: http.StatusOK,
		},
		{
			name:    "Invalid std",
			reqbody: `?viewByStd=13`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid section",
			reqbody: `?viewByStd=3&viewBySection=A2`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid min",
			reqbody: `?viewByStd=3&maxPercent=50&minPercent=-20`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid max",
			reqbody: `?viewByStd=3&maxPercent=-50&minPercent=20`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid combo",
			reqbody: `?viewByStd=3&maxPercent=20&minPercent=50`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `?viewByStd=2`,
			expectedCode: http.StatusUnauthorized,
		},
	}

	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.Cleaner(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)

			req, err := http.NewRequest(http.MethodGet, "/student/display"+tc.reqbody, bytes.NewBufferString(tc.reqbody))
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
			if len(tc.cleanup) > 0 {
				utils.Cleaner(tc.cleanup)
			}
		})
	}
}

func TestDisplaySubject(t *testing.T) {
	testcases := []TestingStructure{
		{
			name:         "Valid",
			reqbody:      `12`,
			prior:        []string{"INSERT INTO subjectAllocation VALUES (12,5)", `INSERT INTO subjects VALUES (125,"anatomy",12,10)`},
			cleanup:      []string{"DELETE FROM subjects WHERE subId=125", "DELETE FROM subjectAllocation WHERE std=12"},
			expectedCode: http.StatusOK,
		},
		{
			name:         "valid but no subject found",
			reqbody:      `12`,
			prior:        []string{"INSERT INTO subjectAllocation VALUES (12,5)"},
			cleanup:      []string{"DELETE FROM subjectAllocation WHERE std=12"},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Invalid std param",
			reqbody:      `13`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `12`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "std 0",
			reqbody:      `0`,
			expectedCode: http.StatusBadRequest,
		},
	}

	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.Cleaner(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodGet, "/student/displaySub?std="+tc.reqbody, bytes.NewBufferString(tc.reqbody))
			if err != nil {
				t.Fatalf("error occured: %v", err)
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
			if len(tc.cleanup) > 0 {
				utils.Cleaner(tc.cleanup)
			}
		})
	}
}
