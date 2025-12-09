package teacher_test

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

type UserData struct {
	UID  string `json:"uid"`
	UPwd string `json:"upwd"`
}

type LoginResponse struct {
	Token string `json:"output"`
	UName string `json:"username"`
	Urole string `json:"role"`
}

var CurrentData struct {
	UserId string
	Token  string
	Role   string
}

func TeacherDeleter() {
	utils.Cleaner([]string{`DELETE FROM activeSessions where sessiontoken="` + CurrentData.Token + `"`})
	utils.Cleaner([]string{`DELETE FROM teachers where tId="` + CurrentData.UserId + `"`})
}

func tokenSetter(tokentype string) string {
	if tokentype == "valid" {
		return `token="` + CurrentData.Token + `"`
	} else {
		return `token="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp.eyJVaWQiOiJBMiJhZG1pbiIsImV4cCI6MTc2NDMzMjUyMSwiaWF0IjoxNzY0MjQ2MTIxfQ.uws7721EbSn41HbLOF1dduPNssuHSLt0VF"`
	}
}

func TestAddStudentsByTeacher(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid grNo",
			reqbody: `{"grNo":1399999999,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":5,"section":"A"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid section",
			reqbody: `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":5,"section":"A1"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid std",
			reqbody: `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":15,"section":"A"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid pwd",
			reqbody: `{"grNo":14,"studPwd":"Asd","userRole":"student","studName":"raj","std":5,"section":"A"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid student name",
			reqbody: `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj6","std":5,"section":"A"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid role",
			reqbody: `{"grNo":14,"studPwd":"Asdf123@","userRole":"admin","studName":"raj","std":5,"section":"A"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "authorization fail",
			reqbody: `{"grNo": 101,"studPwd": "pass123","userRole": "student","studName": "John Doe","std": 10,"section": "A"}`,

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
			reqbody:      `{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`,
			prior:        []string{`INSERT INTO students VALUES (15, "Asdf123@", "student", "raju", 8, "B")`},
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/teacher/createStud", bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestEditStudentsByTeacher(t *testing.T) {

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
			cleanup:      []string{"DELETE FROM students WHERE grNo=15"},
			reqbody:      `{"grNo":15,"std":15}`,
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
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPut, "/teacher/updateStud", bytes.NewBufferString(tc.reqbody))
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
			if len(tc.cleanup) > 0 {
				utils.Cleaner(tc.cleanup)
			}
		})
	}
	TeacherDeleter()
}

func TestAddSubjectByTeacher(t *testing.T) {

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
			reqbody:      `{"subId":125,"subName":"english","levelStd":12,"credits":5}`,
			prior:        []string{"INSERT INTO subjectAllocation VALUES (12,5)"},
			cleanup:      []string{"DELETE FROM subjects WHERE subId=125", "DELETE FROM subjectAllocation WHERE std=12"},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/teacher/createSub", bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestEditSubjectsByTeacher(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid subid",
			reqbody: `{"subId":999999990,"subName":"math 3"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid std",
			reqbody: `{"subId":100,"levelStd":15}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid credits",
			reqbody: `{"subId":100,"credits":-5}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid name",
			reqbody: `{"subId":125,"subName":"mathffskbdibcisdhcksbckdsbcsdbcisdbcisdicvsdicbidscibdsicbicbidbcidbiddsckbbsvvsuvsvsbuksabdsyuc"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "subject doesnt exist",
			reqbody: `{"subId":10103,"subName":"maths 2"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"subId":9999,"subName":"maths 2","levelStd":12,"credits":5}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			reqbody:      `{"subId":125,"subName":"german"}`,
			prior:        []string{"INSERT INTO subjectAllocation VALUES (12,5)", `INSERT INTO subjects VALUES (125,"anatomy",12,10)`},
			cleanup:      []string{"DELETE FROM subjects WHERE subId=125", "DELETE FROM subjectAllocation WHERE std=12"},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPut, "/teacher/updateSub", bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestDisplaySubjectsByTeacher(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid std",
			reqbody: `99`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"std":9}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case with result",
			reqbody:      "12",
			prior:        []string{"INSERT INTO subjectAllocation VALUES (12,5)", `INSERT INTO subjects VALUES (125,"anatomy",12,10)`},
			cleanup:      []string{"DELETE FROM subjects WHERE subId=125", "DELETE FROM subjectAllocation WHERE std=12"},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case with no result",
			reqbody:      "12",
			prior:        []string{"INSERT INTO subjectAllocation VALUES (12,5)"},
			cleanup:      []string{"DELETE FROM subjectAllocation WHERE std=12"},
			expectedCode: http.StatusOK,
		},
		{
			name:    "Limit not set",
			reqbody: "9",

			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.Cleaner(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodGet, "/teacher/displaySub?std="+tc.reqbody, bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestAddMarksByTeacher(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid theory marks",
			reqbody: `{"subId":100,"grNo":13,"theoryMarks":88,"practicalMarks":15}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid practical marks",
			reqbody: `{"subId":100,"grNo":13,"theoryMarks":80,"practicalMarks":-15}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "student not found",
			reqbody: `{"subId":1020,"grNo":1313711,"theoryMarks":80,"practicalMarks":15}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "subject not found",
			reqbody: `{"subId":10021,"grNo":1,"theoryMarks":80,"practicalMarks":15}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"subId":11,"grNo":13,"theoryMarks":80,"practicalMarks":15}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			reqbody:      `{"subId":141,"grNo":1221,"theoryMarks":80,"practicalMarks":15}`,
			prior:        []string{"INSERT INTO subjectAllocation VALUES (3,5)", `INSERT INTO students VALUES (1221,"password","student","selmon",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",3,15)`},
			cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM subjects WHERE subId=141`, "DELETE FROM subjectAllocation WHERE std=3"},
			expectedCode: http.StatusOK,
		},
		{
			name:         "record already present",
			reqbody:      `{"subId":141,"grNo":1221,"theoryMarks":80,"practicalMarks":15}`,
			prior:        []string{"INSERT INTO subjectAllocation VALUES (3,5)", `INSERT INTO students VALUES (1221,"password","student","selmon",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",3,15)`, `INSERT INTO marks VALUES (1221,141,80,20,"AA")`},
			expectedCode: http.StatusBadRequest,
			cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM subjects WHERE subId=141`, "DELETE FROM subjectAllocation WHERE std=3"},
		},
		{
			name:         "standards donot match",
			reqbody:      `{"subId":141,"grNo":1221,"theoryMarks":80,"practicalMarks":15}`,
			prior:        []string{"INSERT INTO subjectAllocation VALUES (7,5)", `INSERT INTO students VALUES (1221,"password","student","selmon",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",7,15)`},
			cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM subjects WHERE subId=141`, "DELETE FROM subjectAllocation WHERE std=7"},
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.Cleaner(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/teacher/enterMarks", bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestEditMarksByTeacher(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid theory marks",
			reqbody: `{"subId":1,"grNo":1,"theoryMarks":-88}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid practical marks",
			reqbody: `{"subId":1,"grNo":1,"practicalMarks":-15}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "student not found",
			reqbody: `{"subId":1,"grNo":131311,"theoryMarks":70}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "subject not found",
			reqbody: `{"subId":111410,"grNo":1,"practicalMarks":13}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"subId":11,"grNo":13,"theoryMarks":80,"practicalMarks":15}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			prior:        []string{`INSERT INTO students VALUES (1221,"password","student","selmon",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",3,15)`, `INSERT INTO marks VALUES (1221,141,80,20,"AA")`},
			reqbody:      `{"subId":141,"grNo":1221,"theoryMarks":50,"practicalMarks":15}`,
			cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM subjects WHERE subId=141`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "record not found to edit",
			reqbody:      `{"subId":141,"grNo":1221,"theoryMarks":80,"practicalMarks":15}`,
			prior:        []string{`INSERT INTO students VALUES (1221,"password","student","selmon",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",3,15)`},
			cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM subjects WHERE subId=141`},
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.Cleaner(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPut, "/teacher/updateMarks", bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestStudentReportByTeacher(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "Valid",
			reqbody:      `1221`,
			prior:        []string{`INSERT INTO students VALUES (1221,"password","student","selmon",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",3,15)`, `INSERT INTO marks VALUES (1221,141,80,20,"AA")`},
			cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM subjects WHERE subId=141`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "valid but no student found",
			reqbody:      `151`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "valid but no result found",
			prior:        []string{`INSERT INTO students VALUES (1443, "Asdf123@", "student", "raju", 8, "B")`},
			cleanup:      []string{"DELETE FROM students WHERE grNo=1443"},
			reqbody:      `1443`,
			expectedCode: http.StatusOK,
		},
		{
			name: "invalid grno",

			reqbody:      "1599999999",
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"grNo":15}`,
			expectedCode: http.StatusUnauthorized,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.Cleaner(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodGet, "/teacher/displayStud?studId="+tc.reqbody, bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestDeleteStudentByTeacher(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid gr no",
			reqbody: `{"grNo":1399999999}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "student not found valid gr no",
			reqbody: `{"grNo":2151}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"grNo":13}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			reqbody:      `{"grNo":1265}`,
			prior:        []string{`INSERT INTO students VALUES (1265, "Asdf123@", "student", "raju", 8, "B")`},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.Cleaner(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodDelete, "/teacher/delStudent", bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestDeleteSubjectByTeacher(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid subject id",
			reqbody: `{"subId":1199999999}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "subject not found",
			reqbody: `{"subId":1112}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"subId":11}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			reqbody:      `{"subId":125}`,
			prior:        []string{"INSERT INTO subjectAllocation VALUES (12,5)", `INSERT INTO subjects VALUES (125,"anatomy",12,10)`},
			cleanup:      []string{"DELETE FROM subjectAllocation WHERE std=12"},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("teacher")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.Cleaner(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodDelete, "/teacher/delSubject", bytes.NewBufferString(tc.reqbody))
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
	TeacherDeleter()
}

func TestAddReviewByTeacher(t *testing.T) {
	CurrentData = utils.UserGenerator("teacher")
	testcases := []TestingStructure{
		{
			name:         "student invalid grno",
			reqbody:      `{"grNo":1399999999,"comment":"sincere"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "valid but student not found",
			reqbody:      `{"grNo":190,"comment":"sincere"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"grNo":13,"comment":"sincere"}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			reqbody:      `{"grNo":1221,"comment":"sincere"}`,
			prior:        []string{`INSERT INTO students VALUES (1221, "Asdf123@", "student", "raju", 8, "B")`},
			cleanup:      []string{"DELETE FROM students WHERE grNo=1221", "DELETE FROM reviews WHERE grNo=1221"},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case but review already present",
			reqbody:      `{"grNo":1221,"comment":"sincere"}`,
			prior:        []string{`INSERT INTO students VALUES (1221, "Asdf123@", "student", "raju", 8, "B")`, `INSERT INTO reviews VALUES ("` + CurrentData.UserId + `", 1221, "bad boy")`},
			cleanup:      []string{"DELETE FROM students WHERE grNo=1221", "DELETE FROM reviews WHERE grNo=1221"},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "too long comment",
			reqbody: `{"grNo":1212,"comment":"sinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresisinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresinceresincerenceresinceresinceresinceresincere"}`,

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
			req, err := http.NewRequest(http.MethodPost, "/teacher/addReview", bytes.NewBufferString(tc.reqbody))
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
