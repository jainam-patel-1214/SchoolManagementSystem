package utils

import (
	"bytes"
	"database/sql"
	"log"
	"net/http"
	"net/http/httptest"
	"strconv"

	"example.com/main/database"
	"example.com/main/routes"
	"github.com/gin-gonic/gin"
)

var dsn = database.InitDb()
var HelperData ResStruct

func tokenSetter() string {
	return `token="` + HelperData.Token + `"`
}

func UserDeleter() {
	Cleaner([]string{`DELETE FROM activeSessions where sessiontoken="` + HelperData.Token + `"`, `DELETE FROM admins where admin_id="` + strconv.Itoa(HelperData.UserId) + `"`})
}

func AddTempTeacher(body string) {
	HelperData = UserGenerator("admin")
	router := routes.InitializeRouter()
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	req, err := http.NewRequest(http.MethodPost, "/admin/addTeacher", bytes.NewBufferString(body))
	if err != nil {
		log.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	ctx.Request = req
	token := tokenSetter()
	req.Header.Set("Cookie", token)
	router.ServeHTTP(w, req)
}
func DeleteTempTeacher(body string) {
	HelperData = UserGenerator("admin")
	router := routes.InitializeRouter()
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	req, err := http.NewRequest(http.MethodDelete, "/admin/delTeacher", bytes.NewBufferString(body))
	if err != nil {
		log.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	ctx.Request = req
	token := tokenSetter()
	req.Header.Set("Cookie", token)
	router.ServeHTTP(w, req)
}
func AddTempSubMarksStudent(studentbody string, subjectAllocationBody string, subjectbody string, markbody string) {
	HelperData = UserGenerator("admin")
	router := routes.InitializeRouter()
	if studentbody != "" {
		p := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(p)
		req, err := http.NewRequest(http.MethodPost, "/admin/createStud", bytes.NewBufferString(studentbody))
		if err != nil {
			log.Fatalf("failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		ctx.Request = req
		token := tokenSetter()
		req.Header.Set("Cookie", token)
		router.ServeHTTP(p, req)
		if p.Code != 200 {
			log.Fatal("in stud test create- got status ", p.Code, p.Body.String())
			return
		} else {
			log.Println("creating student")
		}
	}
	if subjectAllocationBody != "" {
		p := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(p)
		req, err := http.NewRequest(http.MethodPost, "/admin/setSubLimit", bytes.NewBufferString(subjectAllocationBody))
		if err != nil {
			log.Fatalf("failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		ctx.Request = req
		token := tokenSetter()
		req.Header.Set("Cookie", token)
		router.ServeHTTP(p, req)
		if p.Code != 200 {
			log.Fatal("in sublim test create- got status ", p.Code, p.Body.String())
			return
		} else {
			log.Println("creating sublim")
		}
	}
	if subjectbody != "" {
		p := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(p)
		req, err := http.NewRequest(http.MethodPost, "/admin/createSub", bytes.NewBufferString(subjectbody))
		if err != nil {
			log.Fatalf("failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		ctx.Request = req
		token := tokenSetter()
		req.Header.Set("Cookie", token)
		router.ServeHTTP(p, req)
		if p.Code != 200 {
			log.Fatal("in sub test create- got status ", p.Code, p.Body.String())
			return
		} else {
			log.Println("creating sub")
		}
	}
	if markbody != "" {
		p := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(p)
		req, err := http.NewRequest(http.MethodPost, "/admin/enterMarks", bytes.NewBufferString(markbody))
		if err != nil {
			log.Fatalf("failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		ctx.Request = req
		token := tokenSetter()
		req.Header.Set("Cookie", token)
		router.ServeHTTP(p, req)
		if p.Code != 200 {
			log.Fatal("in marks test create- got status ", p.Code, p.Body.String())
			return
		} else {
			log.Println("creating mark")
		}
	}
}
func DeleteTempSubStudent(studentbody string, subjectAllocationBody string, subjectbody string) {
	HelperData = UserGenerator("admin")
	router := routes.InitializeRouter()
	if studentbody != "" {
		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)
		req, err := http.NewRequest(http.MethodDelete, "/admin/delStudent", bytes.NewBufferString(studentbody))
		if err != nil {
			log.Fatalf("failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		ctx.Request = req
		token := tokenSetter()
		req.Header.Set("Cookie", token)
		router.ServeHTTP(w, req)
		if w.Code != 200 {
			log.Fatal("in stud test - got status ", w.Code, w.Body.String())
			return
		} else {
			log.Println("here deleted stud")
		}
	}
	if subjectAllocationBody != "" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			log.Fatal("Error opening DB: ", err)
		}
		if _, err := db.Exec(subjectAllocationBody); err != nil {
			log.Fatal("in sublim", err)
		} else {
			log.Println("here deleted sublim")
		}
	}
	if subjectbody != "" {
		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)
		req, err := http.NewRequest(http.MethodDelete, "/admin/delSubject", bytes.NewBufferString(subjectbody))
		if err != nil {
			log.Fatalf("failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		ctx.Request = req
		token := tokenSetter()
		req.Header.Set("Cookie", token)
		router.ServeHTTP(w, req)
		if w.Code != 200 {
			log.Fatal("in sub test - got status ", w.Body.String())
			return
		} else {
			log.Println("here deleted sub")
		}
	}
}
func DeletePendingreq(pendingBody string) {
	HelperData = UserGenerator("admin")
	router := routes.InitializeRouter()
	if pendingBody != "" {
		w := httptest.NewRecorder()
		ctx, _ := gin.CreateTestContext(w)
		req, err := http.NewRequest(http.MethodDelete, "/admin/rejectRequest", bytes.NewBufferString(pendingBody))
		if err != nil {
			log.Fatalf("failed to create request: %v", err)
		}
		req.Header.Set("Content-Type", "application/json")
		ctx.Request = req
		token := tokenSetter()
		req.Header.Set("Cookie", token)
		router.ServeHTTP(w, req)
		if w.Code != 200 {
			log.Fatal("in stud test - got status ", w.Code, w.Body.String())
			return
		} else {
			log.Println("here deleted stud")
		}
	}
}
func DeleteReviews(reviewBody string) {
	if reviewBody != "" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			log.Fatal("Error opening DB: ", err)
		}
		if _, err := db.Exec(reviewBody); err != nil {
			log.Fatal("in sublim", err)
		} else {
			log.Println("here deleted sublim")
		}
	}
}
func AddReviews(reviewBody string) {
	if reviewBody != "" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			log.Fatal("Error opening DB: ", err)
		}
		if _, err := db.Exec(reviewBody); err != nil {
			log.Fatal("in sublim", err)
		} else {
			log.Println("here deleted sublim")
		}
	}
}
