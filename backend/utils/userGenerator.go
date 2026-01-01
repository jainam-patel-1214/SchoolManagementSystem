package utils

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/http/httptest"

	"example.com/main/routes"
	"github.com/gin-gonic/gin"
)

type UserData struct {
	UID  string `json:"uid"`
	UPwd string `json:"upwd"`
}

type LoginResponse struct {
	Token string `json:"output"`
	UName string `json:"username"`
	Urole string `json:"role"`
}

type ResStruct struct {
	UserId int
	Token  string
	Role   string
}

var CurrentData ResStruct
var empty ResStruct

func UserGenerator(role string) ResStruct {
	router := routes.InitializeRouter()
	data := map[string]string{
		"yourName": "John Doe",
		"password": "password",
		"roleReq":  role,
		"secretK":  "wwww8AxndfnaA82JWAxr2.apFmJkU.1ROK10HmFBf69KxSCtW7S",
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return empty
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
		return empty
	}
	var TempData struct {
		UID  int    `json:"uid"`
		UPwd string `json:"upwd"`
	}
	err = json.Unmarshal(body, &TempData)
	if err != nil {
		log.Fatalf("Error unmarshaling JSON: %v", err)
	}

	logindata := map[string]any{
		"userId":   TempData.UID,
		"password": TempData.UPwd,
		"userRole": role,
	}
	CurrentData.UserId = TempData.UID
	jsonData, err = json.Marshal(logindata)
	if err != nil {
		fmt.Println("Error marshaling JSON:", err)
		return empty
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
		return empty
	}
	var LoginOp LoginResponse
	err = json.Unmarshal(body, &LoginOp)
	if err != nil {
		log.Fatalf("Error unmarshaling JSON: %v", err)
	}
	CurrentData.Token = LoginOp.Token
	CurrentData.Role = LoginOp.Urole
	return CurrentData
}
