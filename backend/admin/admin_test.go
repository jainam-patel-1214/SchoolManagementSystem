package admin_test

import (
	"bytes"
	"fmt"
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
	prior        []string
	cleanup      []string
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

func AdminDeleter() {
	utils.Cleaner([]string{`DELETE FROM activeSessions where sessiontoken="` + CurrentData.Token + `"`})
	utils.Cleaner([]string{`DELETE FROM admins where admin_id=` + strconv.Itoa(CurrentData.UserId)})
}

func tokenSetter(tokentype string) string {
	if tokentype == "valid" {
		return `token="` + CurrentData.Token + `"`
	} else {
		return `token="eyJhbGciOiJIUzI1NiIsInR5cCI6Ikp.eyJVaWQiOiJBMiJhZG1pbiIsImV4cCI6MTc2NDMzMjUyMSwiaWF0IjoxNzY0MjQ2MTIxfQ.uws7721EbSn41HbLOF1dduPNssuHSLt0VF"`
	}
}

func TestAddStudentsByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "Invalid grNo",
			reqbody:      `{"grNo":1399999999,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":5,"section":"A"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid section",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":5,"section":"A1"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid std",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":15,"section":"A"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid pwd",
			reqbody:      `{"grNo":14,"studPwd":"Asd","userRole":"student","studName":"raj","std":5,"section":"A"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid student name",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj6","std":5,"section":"A"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "Invalid role",
			reqbody:      `{"grNo":14,"studPwd":"Asdf123@","userRole":"admin","studName":"raj","std":5,"section":"A"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"grNo": 101,"studPwd": "pass123","userRole": "student","studName": "John Doe","std": 10,"section": "A"}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:    "Valid case",
			reqbody: `{"grNo":14,"studPwd":"Asdf123@","userRole":"student","studName":"raj","std":8,"section":"A"}`,
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":14}`, ``, ``) },
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "student already exists",
			reqbody: `{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`, "", ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
			},
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
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
				fmt.Printf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestEditStudentsByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "Invalid grNo",
			reqbody:      `{"grNo":1399999999,"studPwd":"Asdf1234"`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid section",
			reqbody: `{"grNo":15,"section":"A1"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`, "", ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid std",
			reqbody: `{"grNo":15,"std":15}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`, "", ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid pwd",
			reqbody: `{"grNo":15,"studPwd":"Asd"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`, "", ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid student name",
			reqbody: `{"grNo":15,"studName":"raj6"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`, "", ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
			},
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
			name:    "old and new value same",
			reqbody: `{"grNo":15"studName":"raja"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`, "", ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Valid case",
			reqbody: `{"grNo":15,"studName":"ramu"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf1234","userRole":"student","studName":"raja","std":5,"section":"A"}`, "", ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
			},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
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
			name:    "Valid case",
			reqbody: `{"subId":125,"subName":"english","levelStd":12,"credits":5}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(``, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}`) },
			},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			utils.UserDeleter()
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())
				fmt.Println("body of writer", w.Body.String())
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestEditSubjectsByAdmin(t *testing.T) {

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
			name:    "Valid case",
			reqbody: `{"subId":125,"subName":"german"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(``, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}`) },
			},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPut, "/admin/updateSub", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestAddTeacherByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid tid",
			reqbody: `{"teacherId":999912345678,"tPwd":"Asdf1234","role":"teacher","tName":"yash","subId":9999,"stdAllocated":1,"sectionAllocated":"A"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid section",
			reqbody: `{"teacherId":15,"tPwd":"Asdf1234","role":"teacher","tName":"yash","subId":9999,"stdAllocated":1,"sectionAllocated":"A1"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid std",
			reqbody: `{"teacherId":15,"tPwd":"Asdf1234","role":"teacher","tName":"yash","subId":9999,"stdAllocated":15,"sectionAllocated":"A"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid pwd",
			reqbody: `{"teacherId":15,"tPwd":"1232","role":"teacher","tName":"het"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid teacher name",
			reqbody: `{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"het44"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid role",
			reqbody: `{"teacherId":15,"tPwd":"Asdf1232","role":"student","tName":"het"}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"het"}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:    "Valid case without subject",
			reqbody: `{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`,
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "Valid case with subject",
			reqbody: `{"teacherId":15,"tPwd":"Asdf1234","role":"teacher","tName":"meena","subId":125,"stdAllocated":11,"sectionAllocated":"A"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(``, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}`) },
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusOK,
		},
		{
			name:         "too long name",
			reqbody:      `{"teacherId":15,"tPwd":"Asdf1234","role":"teacher","tName":"enna meena deeka blaaaaaaaaaaa blaaaaaaaaaaa blaaaaaaaaaaa blaaaaaaaaaaa","subId":101,"stdAllocated":11,"sectionAllocated":"B"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "subject not exist",
			reqbody:      `{"teacherId":15,"tPwd":"Asdf1234","role":"teacher","tName":"deeka","subId":10100,"stdAllocated":11,"sectionAllocated":"B"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "teacher already exists",
			reqbody: `{"teacherId":15,"tPwd":"Asdf123@","role":"teacher","tName":"rajmauli"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "missing section",
			reqbody:      `{"teacherId":15,"tPwd":"Asdf123@","role":"teacher","tName":"raj","stdAllocated":1}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "missing std",
			reqbody:      `{"teacherId":15,"tPwd":"Asdf123@","role":"teacher","tName":"raj","sectionAllocated":"A"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "sub provided but missing class",
			reqbody:      `{"teacherId":15,"tPwd":"Asdf123@","role":"teacher","tName":"raj","subId":100}`,
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/admin/addTeacher", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestEditTeacherByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name: "Invalid section",
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			reqbody:      `{"teacherId":15,"sectionAllocated":"A1"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid std",
			reqbody: `{"teacherId":15,"stdAllocated":15}`,
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid pwd",
			reqbody: `{"teacherId":15,"tPwd":"1232"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid teacher name",
			reqbody: `{"teacherId":15,"tName":"het44"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "Invalid teacher name long",
			reqbody: `{"teacherId":15,"tName":"het wjqfujbacbdvjvjvjwjqfujbacbdvjvjvjwjqfujbacbdvjvjvjwjqfujbacbdvjvjvjwjq"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"teacherId":"t100","tPwd":"Asdf1231"}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:    "only editing std for that who hasnt allocated class",
			reqbody: `{"teacherId":15,"stdAllocated":1}`,
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "only editing section for that who hasnt allocated class",
			reqbody: `{"teacherId":15,"sectionAllocated":"A"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "only editing subject for that who hasnt allocated class",
			reqbody: `{"teacherId":15,"subId":125}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
				func() { utils.DeleteTempSubStudent("", "DELETE FROM subjectAllocation WHERE std=12", `{"subId":125}`) },
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "valid case",
			reqbody: `{"teacherId":15,"tName":"god"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "valid case",
			reqbody: `{"teacherId":15,"tName":"prabhu","subId":125,"stdAllocated":12,"sectionAllocated":"B"}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
				func() { utils.DeleteTempSubStudent("", "DELETE FROM subjectAllocation WHERE std=12", `{"subId":125}`) },
			},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPut, "/admin/editTeacher", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestDisplaySubjectsByAdmin(t *testing.T) {

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
			name:    "Valid case with result",
			reqbody: "12",
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent("", "DELETE FROM subjectAllocation WHERE std=12", `{"subId":125}`) },
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "Valid case with no result",
			reqbody: "12",
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent("", "DELETE FROM subjectAllocation WHERE std=12", ``) },
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "Limit not set",
			reqbody: "9",

			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodGet, "/admin/displaySub?std="+tc.reqbody, bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestAddMarksByAdmin(t *testing.T) {

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
			name:    "Valid case",
			reqbody: `{"subId":125,"grNo":15,"theoryMarks":80,"practicalMarks":15}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() {
					utils.DeleteTempSubStudent(`{"grNo":15}`, "DELETE FROM subjectAllocation WHERE std=12", `{"subId":125}`)
				},
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "record already present",
			reqbody: `{"subId":125,"grNo":15,"theoryMarks":80,"practicalMarks":15}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, `{"subId":125,"grNo":15,"theoryMarks":80,"practicalMarks":15}`)
				},
			},
			postFunc: []func(){
				func() {
					utils.DeleteTempSubStudent(`{"grNo":15}`, "DELETE FROM subjectAllocation WHERE std=12", `{"subId":125}`)
				},
			},
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "standards donot match",
			reqbody: `{"subId":125,"grNo":15,"theoryMarks":80,"practicalMarks":15}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":11,"limit":5}`, `{"subId":125,"subName":"english","levelStd":11,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() {
					utils.DeleteTempSubStudent(`{"grNo":15}`, "DELETE FROM subjectAllocation WHERE std=11", `{"subId":125}`)
				},
			},
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/admin/enterMarks", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestEditMarksByAdmin(t *testing.T) {

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
			name:    "Valid case",
			reqbody: `{"subId":125,"grNo":15,"theoryMarks":15,"practicalMarks":19}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, `{"subId":125,"grNo":15,"theoryMarks":80,"practicalMarks":15}`)
				},
			},
			postFunc: []func(){
				func() {
					utils.DeleteTempSubStudent(`{"grNo":15}`, "DELETE FROM subjectAllocation WHERE std=12", `{"subId":125}`)
				},
			},
			expectedCode: http.StatusOK,
		},
		{
			name:    "record not found to edit",
			reqbody: `{"subId":125,"grNo":15,"theoryMarks":15,"practicalMarks":19}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() {
					utils.DeleteTempSubStudent(`{"grNo":15}`, "DELETE FROM subjectAllocation WHERE std=12", `{"subId":125}`)
				},
			},
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPut, "/admin/updateMarks", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestTeacherPerformanceByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			name:         "teacher not taking subject",
			reqbody:      "15",
			expectedCode: http.StatusBadRequest,
		},
		{
			name: "valid",
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
				func() {
					utils.AddTempTeacher(`{"teacherId": 15,"tPwd": "Asdf123@", "role": "teacher","tName": "John Doe","subId": 125,"stdAllocated": 12,"sectionAllocated": "A"}`)
				},
			},
			reqbody: "15",
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
				func() {
					utils.DeleteTempSubStudent(`{"grNo":15}`, "DELETE FROM subjectAllocation WHERE std=12", `{"subId":125}`)
				},
			},
			expectedCode: http.StatusOK,
		},
		{
			name:         "teacher not found",
			reqbody:      "17",
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"tid":"1"}`,
			expectedCode: http.StatusUnauthorized,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodGet, "/admin/displayTeacherPerformance/"+tc.reqbody, bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestStudentReportByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Valid",
			reqbody: `15`,
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
					utils.DeleteTempSubStudent(`{"grNo":16}`, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}}`)
				},
			},
			// prior:        []string{`INSERT INTO students VALUES (1221,"password","student","selmon",3,"A")`, `INSERT INTO subjects VALUES (141,"HINDI",3,15)`, `INSERT INTO marks VALUES (1221,141,80,20,"AA")`},
			// cleanup:      []string{`DELETE FROM students WHERE grNo=1221`, `DELETE FROM subjects WHERE subId=141`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "valid but no student found",
			reqbody:      `151`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name: "valid but no result found",
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, `{"subId":125,"grNo":15,"theoryMarks":80,"practicalMarks":15}`)
				},
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":16,"studPwd":"Asdf123@","userRole":"student","studName":"raja","std":12,"section":"A"}`, ``, ``, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, ``, ``) },
				func() {
					utils.DeleteTempSubStudent(`{"grNo":16}`, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}}`)
				},
			},
			// prior:        []string{`INSERT INTO students VALUES (1443, "Asdf123@", "student", "raju", 8, "B")`},
			// cleanup:      []string{"DELETE FROM students WHERE grNo=1443"},
			reqbody:      `16`,
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
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodGet, "/admin/displayStud?studId="+tc.reqbody, bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestDeleteTeacherByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid teacher id",
			reqbody: `{"teacherId":12345678987}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "teacher not found",
			reqbody: `{"teacherId":15}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"teacherId":13}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name: "Valid case",
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			reqbody:      `{"teacherId":15}`,
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodDelete, "/admin/delTeacher", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestDeleteStudentByAdmin(t *testing.T) {

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
			name:    "Valid case",
			reqbody: `{"grNo":16}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":16,"studPwd":"Asdf123@","userRole":"student","studName":"raja","std":12,"section":"A"}`, ``, ``, ``)
				},
			},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodDelete, "/admin/delStudent", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestDeleteSubjectByAdmin(t *testing.T) {

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
			name:    "Valid case",
			reqbody: `{"subId":125}`,
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent("", "DELETE FROM subjectAllocation WHERE std=12", "") },
			},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodDelete, "/admin/delSubject", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestSetSubLimitByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:    "Invalid std",
			reqbody: `{"std":139,"limit":5}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "invalid limit",
			reqbody: `{"std":12,"limit":-5}`,

			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "authorization fail",
			reqbody:      `{"std":12,"limit":5}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:    "Valid case",
			reqbody: `{"std":12,"limit":5}`,
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent("", "DELETE FROM subjectAllocation WHERE std=12", "") },
			},
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/admin/setSubLimit", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestPendingRequestByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "authorization fail",
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case (auth pass)",
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodGet, "/admin/pendingRequest", bytes.NewBufferString(""))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
		})
	}
}

func TestAcceptPendingRequestByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "authorization fail",
			reqbody:      `{"pendingId":10,"uName":"ta","uPwd":"password","uRole":"admin","Uid":1,"std":0,"section":"A","subId":9999}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "invalid student id",
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"student","Uid":121111111112,"std":5,"section":"A"}`,
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","student","password")`},
			cleanup:      []string{`DELETE FROM pendingApplications WHERE id=99`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "invalid student section",
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","student","password")`},
			cleanup:      []string{`DELETE FROM pendingApplications WHERE id=99`},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"student","Uid":10301,"std":5,"section":"A1"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "invalid student std",
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","student","password")`},
			cleanup:      []string{`DELETE FROM pendingApplications WHERE id=99`},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"student","Uid":1001,"std":15,"section":"A"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "invalid teacher/admin id",
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","teacher","password")`},
			cleanup:      []string{`DELETE FROM pendingApplications WHERE id=99`},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"teacher","Uid":10000000099,"std":5,"section":"A","subId":9999}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "invalid teacher class allocation section",
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","teacher","password")`},
			cleanup:      []string{`DELETE FROM pendingApplications WHERE id=99`},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"teacher","Uid":15,"std":5,"section":"A1","subId":101}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "invalid teacher class allocation std",
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","teacher","password")`},
			cleanup:      []string{`DELETE FROM pendingApplications WHERE id=99`},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"teacher","Uid":15,"std":15,"section":"A","subId":101}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "student already exist",
			prior:   []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","student","password")`},
			cleanup: []string{`DELETE FROM pendingApplications WHERE id=99`},
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(`{"grNo":15,"studPwd":"Asdf123@","userRole":"student","studName":"raju","std":12,"section":"B"}`, "", "", "")
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":15}`, "", "") },
			},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"student","Uid":15,"std":5,"section":"A"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:    "teacher already exist",
			prior:   []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","teacher","password")`},
			cleanup: []string{`DELETE FROM pendingApplications WHERE id=99`},
			priorFunc: []func(){
				func() {
					utils.AddTempTeacher(`{"teacherId":15,"tPwd":"Asdf1232","role":"teacher","tName":"enna"}`)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":15}`) },
			},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"teacher","Uid":15}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "admin already exist",
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","admin","password")`, `INSERT INTO admins VALUES (1,"jay","password")`},
			cleanup:      []string{`DELETE FROM pendingApplications WHERE id=99`},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"admin","Uid":1}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:  "Valid case student",
			prior: []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","student","password")`},
			postFunc: []func(){
				func() { utils.DeleteTempSubStudent(`{"grNo":187}`, "", "") },
			},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"student","Uid":187,"std":5,"section":"A"}`,
			expectedCode: http.StatusOK,
		},
		{
			name:  "Valid case teacher without subject and class",
			prior: []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","teacher","password")`},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":187}`) },
			},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"teacher","Uid":187}`,
			expectedCode: http.StatusOK,
		},
		{
			name:  "Valid case teacher with subject and class",
			prior: []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","teacher","password")`},
			priorFunc: []func(){
				func() {
					utils.AddTempSubMarksStudent(``, `{"std":12,"limit":5}`, `{"subId":125,"subName":"english","levelStd":12,"credits":5}`, ``)
				},
			},
			postFunc: []func(){
				func() { utils.DeleteTempTeacher(`{"teacherId":187}`) },
				func() {
					utils.DeleteTempSubStudent(``, `DELETE FROM subjectAllocation WHERE std=12`, `{"subId":125}`)
				},
			},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"teacher","Uid":187,"std":10,"section":"A","subId":125}`,
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case admin",
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","admin","password")`},
			cleanup:      []string{`DELETE FROM admins WHERE admin_id=187`},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"admin","Uid":187}`,
			expectedCode: http.StatusOK,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			t.Log(tc.name)
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			for _, task := range tc.priorFunc {
				task()
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/admin/acceptRequest", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())
			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			if len(tc.cleanup) > 0 {
				utils.Cleaner(tc.cleanup)
			}
			for _, task := range tc.postFunc {
				task()
			}
			utils.UserDeleter()
		})
	}
	AdminDeleter()
}

func TestRejectPendingRequestByAdmin(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "authorization fail",
			reqbody:      `{"uName":"temp stud","uPwd":"password","uRole":"student"}`,
			expectedCode: http.StatusUnauthorized,
		},
		{
			name:         "Valid case",
			prior:        []string{`INSERT INTO pendingApplications VALUES (99,"SINGHAM","admin","password")`},
			reqbody:      `{"pendingId":99,"uName":"SINGHAM","uPwd":"password","uRole":"admin"}`,
			expectedCode: http.StatusOK,
		},
		{
			name:         "inValid case, request not found",
			reqbody:      `{"pendingId":99,"uName":"ts","uPwd":"password","uRole":"student"}`,
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodDelete, "/admin/rejectRequest", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			if len(tc.cleanup) > 0 {
				utils.Cleaner(tc.cleanup)
			}
		})
	}
	AdminDeleter()
}

func TestRegister(t *testing.T) {

	testcases := []TestingStructure{
		{
			name:         "Valid case student",
			reqbody:      `{"yourName":"tempstudTEST","password":"password","roleReq":"student"}`,
			cleanup:      []string{`DELETE FROM pendingApplications WHERE username="tempstudTEST" AND role_requested="student" AND user_pwd="password"`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case student secretk",
			reqbody:      `{"yourName":"tempstudTEST","password":"password","roleReq":"student","secretK":"$2a$15$NXTb8AxndfnaA82JWAxr2.apFmJkU.S1ROK10HmFBf69KxSCtW7S"}`,
			cleanup:      []string{`DELETE FROM students WHERE studName="tempstudTEST" AND userRole="student" AND sPwd="password"`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case teacher",
			reqbody:      `{"yourName":"teachpTEST","password":"password","roleReq":"teacher"}`,
			cleanup:      []string{`DELETE FROM pendingApplications WHERE username="teachpTEST" AND role_requested="teacher" AND user_pwd="password"`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case teacher secretk",
			reqbody:      `{"yourName":"teachpTEST","password":"password","roleReq":"teacher","secretK":"$2a$15$NXTb8AxndfnaA82JWAxr2.apFmJkU.S1ROK10HmFBf69KxSCtW7S"}`,
			cleanup:      []string{`DELETE FROM teachers WHERE tName="teachpTEST" AND userRole="teacher" AND tPwd="password"`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case admin",
			reqbody:      `{"yourName":"tempadmTEST","password":"password","roleReq":"admin"}`,
			cleanup:      []string{`DELETE FROM pendingApplications WHERE username="tempadmTEST" AND role_requested="admin" AND user_pwd="password"`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "Valid case admin secretk",
			reqbody:      `{"yourName":"tempadmTEST","password":"password","roleReq":"admin","secretK":"$2a$15$NXTb8AxndfnaA82JWAxr2.apFmJkU.S1ROK10HmFBf69KxSCtW7S"}`,
			cleanup:      []string{`DELETE FROM admins WHERE admin_name="tempadmTEST" AND admin_pwd="password"`},
			expectedCode: http.StatusOK,
		},
		{
			name:         "invalid name",
			reqbody:      `{"yourName":"studd55","password":"password","roleReq":"student","secretK":"$2a$15$NXTb8AxndfnaA82JWAxr2.apFmJkU.S1ROK10HmFBf69KxSCtW7S"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "invalid pwd",
			reqbody:      `{"yourName":"studd","password":"psword","roleReq":"teacher"}`,
			expectedCode: http.StatusBadRequest,
		},
		{
			name:         "invalid role",
			reqbody:      `{"yourName":"studd","password":"password","roleReq":"sweeper","secretK":"$2a$15$NXTb8AxndfnaA82JWAxr2.apFmJkU.S1ROK10HmFBf69KxSCtW7S"}`,
			expectedCode: http.StatusBadRequest,
		},
	}
	CurrentData = utils.UserGenerator("admin")
	router := routes.InitializeRouter()
	for _, tc := range testcases {
		t.Run(tc.name, func(t *testing.T) {
			if len(tc.prior) > 0 {
				utils.PriorRuns(tc.prior)
			}
			w := httptest.NewRecorder()
			ctx, _ := gin.CreateTestContext(w)
			req, err := http.NewRequest(http.MethodPost, "/register", bytes.NewBufferString(tc.reqbody))
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
				log.Fatalf("%s in this test - expected status %d, got %v", tc.name, tc.expectedCode, w.Body.String())

			}
			t.Logf("%s - testname, Response = %s", tc.name, w.Body.String())
			if len(tc.cleanup) > 0 {
				utils.Cleaner(tc.cleanup)
			}
		})
	}
	AdminDeleter()
}
