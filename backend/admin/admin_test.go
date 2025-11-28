package admin

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"

	"example.com/main/middleware"
	"example.com/main/utils"
	"github.com/gin-gonic/gin"
	// "example.com/main/student"
	// "github.com/gin-gonic/gin"
)

func TestAddStudentsByAdmin(t *testing.T) {

	testcases := []struct {
		name         string
		reqbody      string
		prior        []string
		cleanup      []string
		token        string
		expectedCode int
	}{
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
	router := gin.New()
	router.Use(middleware.ValidateSession())
	router.POST("/admin/createStud", AddStudent)
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
				tc.token = `token="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp.eyJVaWQiOiJBMiJhZG1pbiIsImV4cCI6MTc2NDMzMjUyMSwiaWF0IjoxNzY0MjQ2MTIxfQ.uws7721EbSn41HbLOF1dduPNssuHSLt0VF"`
			} else {
				tc.token = `token="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVaWQiOiJBMSIsIlJvbGUiOiJhZG1pbiIsImV4cCI6MTc2NDMzMjUyMSwiaWF0IjoxNzY0MjQ2MTIxfQ.uws7721EbSn41HbLOF1dduPNssuHSLt0VFfaMac3xgE"`
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
