package student_test

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"example.com/main/routes"
	"example.com/main/utils"
	"github.com/gin-gonic/gin"
)

type TestingStructure struct {
	name         string
	reqbody      string
	priorFunc    []func()
	postFunc     []func()
	token        string
	expectedCode int
}

var CurrentData struct {
	UserId int
	Token  string
	Role   string
}

func StudentDeleter() {
	utils.Cleaner([]string{`DELETE FROM activeSessions where sessiontoken="` + CurrentData.Token + `"`})
	utils.Cleaner([]string{`DELETE FROM students where grNo=` + strconv.Itoa(CurrentData.UserId)})
}

func tokenSetter(tokentype string) string {
	if tokentype == "valid" {
		return `token="` + CurrentData.Token + `"`
	} else {
		return `token="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp.eyJVaWQiOiJBMiJhZG1pbiIsImV4cCI6MTc2NDMzMjUyMSwiaWF0IjoxNzY0MjQ2MTIxfQ.uws7721EbSn41HbLOF1dduPNssuHSLt0VF"`
	}
}

func TestDisplayStudents(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Valid case",
			reqbody: `?viewByStd=12`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, `{"subId":125,"grNo":15,"theoryMarks":80,"practicalMarks":15}`)
				},
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":16,"studPwd":"Asdf123@","userRole":"student","studName":"raja","std":12,"section":"A"}`, ``, ``, `{"subId":125,"grNo":16,"theoryMarks":10,"practicalMarks":15}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
				func() {
					utils.DeleteTempSubStudent(`{"grNo":16}`, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}`)
				},
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "Valid case",
			reqbody: `?viewByStd=12&maxPercent=50&minPercent=20`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, `{"subId":125,"grNo":15,"theoryMarks":80,"practicalMarks":15}`)
				},
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":16,"studPwd":"Asdf123@","userRole":"student","studName":"raja","std":12,"section":"A"}`, ``, ``, `{"subId":125,"grNo":16,"theoryMarks":20,"practicalMarks":15}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
				func() {
					utils.DeleteTempSubStudent(`{"grNo":16}`, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}`)
				},
			},
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
	CurrentData = utils.UserGenerator("student")
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)

			req, err := http.NewRequest(http.MethodGet, "/student/display"+tc.reqbody, bytes.NewBufferString(tc.reqbody))
			if err != nil {
				t.Fatalf("failed to create request: %v", err)
			}

			ctx.Request = req
			if tc.name == "authorization fail" {
				tc.token = tokenSetter("invalid")
			} else {
				tc.token = tokenSetter("valid")
			}
			req.Header.Set("Content-Type", "application/json")
			req.Header.Set("Cookie", tc.token)
			router.ServeHTTP(w, req)
			if w.Code != tc.expectedCode {
				t.Errorf("%s in this test - expected status %d, got %d", tc.name, tc.expectedCode, w.Code)
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			log.Printf("%v", w.Body)
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	StudentDeleter()
}

func TestDisplaySubject(t *testing.T) {
	testcases := []TestingStructure{
		{
			name:    "Valid",
			reqbody: `12`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() {
					utils.DeleteTempSubStudent(``, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}`)
				},
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "valid but no subject found",
			reqbody: `12`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, ``, ``)
				},
			},
			postFunc: []func(){
				func() {
					utils.DeleteTempSubStudent(``, `DELETE FROM subjectAllocation WHERE std=12`, ``)
				},
			},
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
	CurrentData = utils.UserGenerator("student")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
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
			log.Printf("%v", w.Body)
			for _, task := range tc.postFunc {
				task()
			}
		})
	}
	StudentDeleter()
}
