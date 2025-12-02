package student_test

import (
	"bytes"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httptest"
	"strconv"
	"testing"

	"io"

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
	UID  int    `json:"uid"`
	UPwd string `json:"upwd"`
}

type LoginResponse struct {
	Token string `json:"output"`
	UName string `json:"username"`
	Urole string `json:"role"`
}

var CurrentData struct {
	UserId int
	Token  string
}

func StudentGenerator() {
	router := routes.InitializeRouter()
	log.Printf("%v", "within generator function")
	data := map[string]string{
		"yourName": "John Doe",
		"password": "password",
		"roleReq":  "student",
		"secretK":  "$2a$15$NXTb8AxndfnaA82JWAxr2.apFmJkU.S1ROK10HmFBf69KxSCtW7S",
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return
	}
	w := httptest.NewRecorder()
	v := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)

	req, err := http.NewRequest(http.MethodPost, "/register", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("failed to create request: %v", err)
	}
	ctx.Request = req
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)
	body, err := io.ReadAll(w.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}
	var result UserData

	err = json.Unmarshal(body, &result)
	if err != nil {
		log.Fatalf("Error unmarshaling JSON: %v", err)
	}
	CurrentData.UserId = result.UID
	logindata := map[string]any{
		"userId":   result.UID,
		"password": result.UPwd,
	}
	jsonData, err = json.Marshal(logindata)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return
	}
	req, err = http.NewRequest(http.MethodPost, "/login", bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("failed to create request: %v", err)
	}
	ctx.Request = req
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(v, req)
	body, err = io.ReadAll(v.Body)
	if err != nil {
		fmt.Println("Error reading response body:", err)
		return
	}
	var LoginOp LoginResponse
	err = json.Unmarshal(body, &LoginOp)
	if err != nil {
		log.Fatalf("Error unmarshaling JSON: %v", err)
	}
	CurrentData.Token = LoginOp.Token
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
	StudentGenerator()
	for _, tc := range testcases {
		fmt.Println(CurrentData.Token)
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

			ctx.Request = req
			fmt.Println("setter else -----------", tokenSetter("valid"))
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
			if len(tc.cleanup) > 0 {
				utils.Cleaner(tc.cleanup)
			}
		})
	}
	StudentDeleter()
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
	StudentGenerator()
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
			log.Printf("%v", w.Body)
			if len(tc.cleanup) > 0 {
				utils.Cleaner(tc.cleanup)
			}
		})
	}
	StudentDeleter()
}
