package utils

import (
	"bytes"
	"log"
	"net/http"
	"net/http/httptest"

	"example.com/main/routes"
	"github.com/gin-gonic/gin"
)

var HelperData ResStruct

func tokenSetter() string {
	return `token="` + HelperData.Token + `"`
}

func UserDeleter() {
	Cleaner([]string{`DELETE FROM activeSessions where sessiontoken="` + HelperData.Token + `"`, `DELETE FROM admins where admin_id="` + HelperData.UserId + `"`})
}

func AddTempStudent(body string) {
	HelperData = UserGenerator("admin")
	router := routes.InitializeRouter()
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	req, err := http.NewRequest(http.MethodPost, "/admin/createStud", bytes.NewBufferString(body))
	if err != nil {
		log.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	ctx.Request = req
	token := tokenSetter()
	req.Header.Set("Cookie", token)
	router.ServeHTTP(w, req)
}
func DeleteTempStudent(body string) {
	router := routes.InitializeRouter()
	w := httptest.NewRecorder()
	ctx, _ := gin.CreateTestContext(w)
	req, err := http.NewRequest(http.MethodDelete, "/admin/delStudent", bytes.NewBufferString(body))
	if err != nil {
		log.Fatalf("failed to create request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	ctx.Request = req
	token := tokenSetter()
	req.Header.Set("Cookie", token)
	router.ServeHTTP(w, req)
}
