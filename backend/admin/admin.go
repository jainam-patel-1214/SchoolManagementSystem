package admin

import (
	"database/sql"
	"fmt"
	"math/rand"
	"net/http"
	"strconv"

	"example.com/main/database"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

var dsn = database.InitDb()

const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"

func Random8DigitInt() int {
	return rand.Intn(90000000) + 10000000
}

func RandomString(length int) string {
	result := make([]byte, length)
	for i := range result {
		result[i] = charset[rand.Intn(len(charset))]
	}
	return string(result)
}

func CreatePendingReq(ctx *gin.Context) {
	var PendingDb struct {
		RoleRequested string `json:"roleReq" binding:"required"`
		Username      string `json:"yourName" binding:"required"`
		Pwd           string `json:"password" binding:"required"`
		SecretKey     string `json:"secretK"`
	}
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect to db"})
		return
	}
	defer db.Close()

	err = ctx.ShouldBindJSON(&PendingDb)
	if err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "cannot read body"})
		return
	}
	if PendingDb.Username == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide your name"})
		return
	}
	if PendingDb.Username != "" && !HasOnlyAlphabets(PendingDb.Username) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide valid name"})
		return
	}
	if PendingDb.Pwd == "" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide valid password"})
		return
	}
	if len(PendingDb.Pwd) != 8 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "8 digit password required"})
		return
	}
	if PendingDb.RoleRequested != "student" && PendingDb.RoleRequested != "teacher" && PendingDb.RoleRequested != "admin" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "role your requested doesnot exist"})
		return
	}
	if PendingDb.SecretKey == "$2a$15$NXTb8AxndfnaA82JWAxr2.apFmJkU.S1ROK10HmFBf69KxSCtW7S" {
		switch PendingDb.RoleRequested {
		case "student":
			id := Random8DigitInt()
			_, err = db.Exec("INSERT INTO students (grNo,sPwd,userRole,studName,std,section) VALUES (?,?,?,?,?,?)", id, PendingDb.Pwd, PendingDb.RoleRequested, PendingDb.Username, 10, "X")
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error creating id"})
				return
			} else {
				ctx.JSON(http.StatusOK, gin.H{"output": fmt.Sprintf("your_id = %d and pwd = %s", id, PendingDb.Pwd)})
				return
			}
		case "teacher":
			id := RandomString(8)
			_, err = db.Exec("INSERT INTO teachers (tId,tPwd,userRole,tName) VALUES (?,?,?,?)", id, PendingDb.Pwd, PendingDb.RoleRequested, PendingDb.Username)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error creating id"})
				return
			} else {
				ctx.JSON(http.StatusOK, gin.H{"output": fmt.Sprintf("your_id = %s and pwd = %s", id, PendingDb.Pwd)})
				return
			}
		case "admin":
			id := RandomString(8)
			fmt.Println(id, PendingDb.Username, PendingDb.Pwd)
			_, err = db.Exec("INSERT INTO admins (admin_id,admin_name,admin_pwd) VALUES (?,?,?)", id, PendingDb.Username, PendingDb.Pwd)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error creating id"})
				return
			} else {
				ctx.JSON(http.StatusOK, gin.H{"output": fmt.Sprintf("your_id = %s and pwd = %s for login", id, PendingDb.Pwd)})
				return
			}
		default:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid role requested"})
			return
		}
	}
	_, err = db.Exec("INSERT INTO pendingApplications (username,role_requested,user_pwd) VALUES (?,?,?)", PendingDb.Username, PendingDb.RoleRequested, PendingDb.Pwd)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error processing query"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"output": "registeration request submitted"})
}

func AcceptPendingReq(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
		return
	} else {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect to db"})
			return
		}
		defer db.Close()
		var body struct {
			PendingId int    `json:"pendingId" binding:"required"`
			UserName  string `json:"uName" binding:"required"`
			UserPwd   string `json:"uPwd" binding:"required"`
			UserRole  string `json:"uRole" binding:"required"`
			UserId    any    `json:"Uid" binding:"required"`
			Std       int    `json:"std"`
			Section   string `json:"section"`
			SubId     int    `json:"subId"`
		}
		err = ctx.ShouldBindJSON(&body)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error reading body"})
			return
		}
		if body.UserName == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide your name"})
			return
		}
		if body.UserName != "" && !HasOnlyAlphabets(body.UserName) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid name"})
			return
		}
		if body.UserPwd == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide password"})
			return
		}
		if len(body.UserPwd) != 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "size limit of passoword is 8"})
			return
		}
		if body.UserRole != "student" && body.UserRole != "teacher" && body.UserRole != "admin" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "role your requested doesnot exist"})
			return
		}
		var amt int
		fmt.Println(body.PendingId, "pendding id")
		if err = db.QueryRow(fmt.Sprintf("SELECT COUNT(id) FROM pendingApplications WHERE username='%s' AND role_requested='%s' AND user_pwd='%s' AND id='%d'", body.UserName, body.UserRole, body.UserPwd, body.PendingId)).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "no such pending request exist"})
			return
		}
		if body.UserRole == "student" {
			switch body.UserId.(type) {
			case float64:
				temp := int(body.UserId.(float64))
				if temp <= 0 || temp > 99999999 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "student gr number shall be non negative and max 8 digit"})
					return
				}
				var amt int
				if err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo=?", temp).Scan(&amt); err != nil && err != sql.ErrNoRows {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
					return
				}
				if amt > 0 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "student already exist with gr number provided, try updating student details"})
					return
				}
				if body.Section == "" || body.Std == 0 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "student requires a class and section to be assigned"})
					return
				}
				if body.Std < 1 || body.Std > 12 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "standar shall be between 1 and 12"})
					return
				}
				if !HasOnlyAlphabets(body.Section) {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "section only has letters"})
					return
				}
			default:
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id for student role, provid 8digit unique int only"})
				return
			}
		}
		if body.UserRole == "teacher" {
			switch body.UserId.(type) {
			case string:
				temp := body.UserId.(string)
				if temp == "" {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "teacher id is required to move forward"})
					return
				}
				if len(temp) > 8 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "teacher id shall be less than 8 characters in size"})
					return
				}
				var amt int
				if err = db.QueryRow("SELECT COUNT(tId) FROM teachers WHERE tId=?", temp).Scan(&amt); err != nil {
					ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				if amt > 0 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "teacher id you wish to add already exist"})
					return
				}
				if body.SubId != 0 && (body.SubId <= 0 || body.SubId > 99999999) && body.Section == "" && body.Std == 0 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "to allocate subject allocate std and section so we can calculate peformance"})
					return
				}
				if body.Std != 0 && (body.Std < 13 && body.Std > 0) && body.Section == "" {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "standard needs a section to be provided"})
					return
				}
				if body.Section != "" {
					if !HasOnlyAlphabets(body.Section) {
						ctx.JSON(http.StatusBadRequest, gin.H{"error": "section only has letters"})
						return
					}
					if body.Std == 0 {
						ctx.JSON(http.StatusBadRequest, gin.H{"error": "section needs a standard to be provided"})
						return
					}
					if body.Std < 1 || body.Std > 12 {
						ctx.JSON(http.StatusBadRequest, gin.H{"error": "standar shall be between 1 and 12"})
						return
					}
					if body.SubId != 0 && (body.SubId > 0 || body.SubId < 99999999) {
						var amt int
						if err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE subId=?", body.SubId).Scan(&amt); err != nil && err != sql.ErrNoRows {
							ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
							return
						}
						if amt <= 0 {
							ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject donot exist you want to assign"})
							return
						}
						return
					} else if body.SubId == 0 {

					} else {
						ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id"})
					}
				}
			default:
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id for teacher/admin role, provid 8 digit unique string only"})
				return
			}
		}
		if body.UserRole == "admin" {
			switch body.UserId.(type) {
			case string:
				temp := body.UserId.(string)
				if temp == "" {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "admin id required to move forward"})
					return
				}
				if len(temp) > 8 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "admin id shall be less than 8 characters in size"})
					return
				}
				var amt int
				if err = db.QueryRow("SELECT COUNT(admin_id) FROM admins WHERE admin_id=?", temp).Scan(&amt); err != nil {
					ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
					return
				}
				if amt > 0 {
					ctx.JSON(http.StatusBadRequest, gin.H{"error": "admin id you wish to add already exist"})
					return
				}
			default:
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid user id for admin role, provid 8 digit unique string only"})
				return
			}
		}

		switch body.UserRole {
		case "student":
			if body.Std == 0 || body.Section == "" || body.UserId == 0 || body.UserId == "" || body.UserName == "" || body.UserPwd == "" {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "fill userid/std/section accurately"})
				return
			}
			_, err = db.Exec("INSERT INTO students (grNo,sPwd,userRole,studName,std,section) VALUES (?,?,?,?,?,?)", body.UserId, body.UserPwd, body.UserRole, body.UserName, body.Std, body.Section)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while updating VAL in DB"})
				return
			}
			_, err = db.Exec(fmt.Sprintf("DELETE FROM pendingApplications WHERE username='%s' AND role_requested='%s' AND user_pwd='%s' AND id='%d'", body.UserName, body.UserRole, body.UserPwd, body.PendingId))
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			ctx.JSON(http.StatusOK, gin.H{"output": "student created"})
			return
		case "teacher":
			if body.UserId == 0 || body.UserName == "" || body.UserPwd == "" {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "fill userid/std/section accurately"})
				return
			}
			_, err = db.Exec("INSERT INTO teachers (tId,tPwd,userRole,tName,subId,stdAllocated,sectionAllocated) VALUES (?,?,?,?,?,?,?)", body.UserId, body.UserPwd, body.UserRole, body.UserName, body.SubId, body.Std, body.Section)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			_, err = db.Exec(fmt.Sprintf("DELETE FROM pendingApplications WHERE username='%s' AND role_requested='%s' AND user_pwd='%s' AND id='%d'", body.UserName, body.UserRole, body.UserPwd, body.PendingId))
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			ctx.JSON(http.StatusOK, gin.H{"output": "teacher created"})
			return
		case "admin":
			if body.UserId == 0 || body.UserName == "" || body.UserPwd == "" {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "fill userid/name/pwd accurately"})
				return
			}
			_, err = db.Exec("INSERT INTO admins (admin_id,admin_name,admin_pwd) VALUES (?,?,?)", body.UserId, body.UserName, body.UserPwd)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while updating VAL in DB"})
				return
			}
			_, err = db.Exec(fmt.Sprintf("DELETE FROM pendingApplications WHERE username='%s' AND role_requested='%s' AND user_pwd='%s' AND id='%d'", body.UserName, body.UserRole, body.UserPwd, body.PendingId))
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			ctx.JSON(http.StatusOK, gin.H{"output": "admin created"})
			return
		default:
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid role provided"})
			return
		}
	}
}

func ShowPendingReq(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
		return
	} else {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect to db"})
			return
		}
		defer db.Close()
		type PendingDb struct {
			PendingId     int    `json:"pendingId"`
			RoleRequested string `json:"roleReq"`
			Username      string `json:"userName"`
			Pwd           string `json:"pwd"`
		}
		var result []PendingDb
		res, err := db.Query("SELECT * FROM pendingApplications")
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while fetching data"})
			return
		}
		for res.Next() {
			var temp PendingDb
			err = res.Scan(&temp.PendingId, &temp.Username, &temp.RoleRequested, &temp.Pwd)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error scanning result of db"})
				return
			}
			result = append(result, temp)
		}
		if len(result) == 0 {
			ctx.JSON(http.StatusOK, gin.H{"output": "no pending request found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": result})
	}
}

func DeleteTeacher(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	} else if role == "admin" {
		var tid struct {
			TId string `json:"teacherId" binding:"required"`
		}
		if err := ctx.ShouldBindJSON(&tid); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "unable to read body"})
			return
		}
		if tid.TId == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide a teacher id"})
			return
		}
		if len(tid.TId) > 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide a valid teacher id"})
			return
		}
		var amt int

		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		if err = db.QueryRow("SELECT COUNT(tId) FROM teachers WHERE tId=?", tid.TId).Scan(&amt); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "teacher you wish to reomve donot exist"})
			return
		}
		defer db.Close()
		if _, err = db.Exec("DELETE FROM teachers WHERE tId = ?", tid.TId); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error in DB, cant delete"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "DELETED SUCCESSFULLY"})
	}
}

func RejectRequest(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
		return
	} else if role == "admin" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect to db"})
			return
		}
		defer db.Close()
		var body struct {
			PendingId int    `json:"pendingId" binding:"required"`
			UserName  string `json:"uName" binding:"required"`
			UserPwd   string `json:"uPwd" binding:"required"`
			UserRole  string `json:"uRole" binding:"required"`
		}
		err = ctx.ShouldBindJSON(&body)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error reading body"})
			return
		}
		if body.UserName == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide username"})
			return
		}
		if body.UserRole == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide user role"})
			return
		}
		if body.UserPwd == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide user password"})
			return
		}
		var amount int
		if err = db.QueryRow(fmt.Sprintf("SELECT COUNT(username) FROM pendingApplications WHERE username='%s' AND user_pwd='%s' AND role_requested = '%s' AND id='%d'", body.UserName, body.UserPwd, body.UserRole, body.PendingId)).Scan(&amount); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while rejecting"})
			return
		}
		if amount <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "no such pending request exists"})
			return
		}
		if _, err = db.Exec(fmt.Sprintf("DELETE FROM pendingApplications WHERE username='%s' AND user_pwd='%s' AND role_requested = '%s' AND id='%d'", body.UserName, body.UserPwd, body.UserRole, body.PendingId)); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while rejecting"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "rejected successfully"})
	}
}
func AddTeacher(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	} else if role == "admin" {
		var tdata struct {
			TId              string `json:"teacherId" binding:"required"`
			Tpwd             string `json:"tPwd" binding:"required"`
			Role             string `json:"role" binding:"required"`
			Name             string `json:"tName" binding:"required"`
			SubAllocated     int    `json:"subId"`
			StdAllocated     int    `json:"stdAllocated"`
			SectionAllocated string `json:"sectionAllocated"`
		}
		if err := ctx.ShouldBindJSON(&tdata); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "unable to read body"})
			return
		}
		if tdata.TId == "" || len(tdata.TId) > 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide a valid teacher id"})
			return
		}
		if len(tdata.Tpwd) != 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide 8 digit pwd"})
			return
		}
		if tdata.Name == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide a teacher name"})
			return
		} else {
			if tdata.Name != "" && !HasOnlyAlphabets(tdata.Name) {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid name provided"})
				return
			}
		}
		if tdata.StdAllocated != 0 && (tdata.StdAllocated < 0 || tdata.StdAllocated > 12) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "standard from 1 to 12 are only allowed"})
			return
		}
		if tdata.SectionAllocated != "" && !HasOnlyAlphabets(tdata.SectionAllocated) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid section provided"})
			return
		}
		if tdata.SectionAllocated != "" && tdata.StdAllocated == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "if you allocate section, standard is needed"})
			return
		}
		if tdata.SectionAllocated == "" && tdata.StdAllocated != 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "if you allocate standard, section is needed"})
			return
		}
		if tdata.Role != "teacher" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid role provided, it shall always be teacher"})
			return
		}
		if len(tdata.Name) > 50 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "too long name provided"})
			return
		}
		if tdata.SubAllocated != 0 && (tdata.SubAllocated < 0 || tdata.SubAllocated > 99999999) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject it provided"})
			return
		}
		if tdata.SubAllocated != 0 && (tdata.SectionAllocated == "" || tdata.StdAllocated == 0) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "pls assign std and section if you are assigning subject else you wont be able to calculate teacher's performance"})
			return
		}
		var amt int

		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		defer db.Close()
		if err = db.QueryRow("SELECT COUNT(tId) FROM teachers WHERE tId=?", tdata.TId).Scan(&amt); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amt > 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "teacher id you wish to add already exist"})
			return
		}
		if tdata.SubAllocated != 0 {
			var amt2 int
			if err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE subId=?", tdata.SubAllocated).Scan(&amt2); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if amt2 <= 0 {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject doesnot exist you want to assign to teacher"})
				return
			}
		}
		if _, err = db.Exec("INSERT INTO teachers (tId,tPwd,userRole,tName,subId,stdAllocated,sectionAllocated) values (?,?,?,?,?,?,?)", tdata.TId, tdata.Tpwd, tdata.Role, tdata.Name, tdata.SubAllocated, tdata.StdAllocated, tdata.SectionAllocated); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error in DB, cant insert"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "ADDED SUCCESSFULLY"})
	}
}

func EditTeacher(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	}
	if role == "admin" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		defer db.Close()
		var tdata struct {
			TId              string `json:"teacherId" binding:"required"`
			Tpwd             string `json:"tPwd"`
			Role             string `json:"role"`
			Name             string `json:"tName"`
			SubAllocated     int    `json:"subId"`
			StdAllocated     int    `json:"stdAllocated"`
			SectionAllocated string `json:"sectionAllocated"`
		}
		var defaultData struct {
			TId              string         `json:"teacherId" binding:"required"`
			Tpwd             string         `json:"tPwd"`
			Role             string         `json:"role"`
			Name             string         `json:"tName"`
			SubAllocated     sql.NullInt64  `json:"subId"`
			StdAllocated     sql.NullInt64  `json:"stdAllocated"`
			SectionAllocated sql.NullString `json:"sectionAllocated"`
		}
		if err := ctx.ShouldBindJSON(&tdata); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "unable to read body"})
			return
		}
		if tdata.TId == "" || len(tdata.TId) > 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide a teacher id"})
			return
		}
		var amt int
		if err := db.QueryRow("SELECT COUNT(tId) FROM teachers WHERE tId=?", tdata.TId).Scan(&amt); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "teacher doesnot exist you want to edit"})
			return
		}
		if len(tdata.Name) > 50 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "too long name provided"})
			return
		}
		if tdata.Name != "" {
			if !HasOnlyAlphabets(tdata.Name) {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid name provided"})
				return
			}
		}
		if tdata.Role != "" && tdata.Role != "teacher" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid role provided, it shall always be teacher"})
			return
		}
		if len(tdata.TId) > 8 || len(tdata.TId) <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide a valid teacher id"})
			return
		}
		if tdata.Tpwd != "" && len(tdata.Tpwd) != 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide 8 digit pwd"})
			return
		}
		if tdata.StdAllocated != 0 && (tdata.StdAllocated < 0 || tdata.StdAllocated > 12) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "standard from 1 to 12 are only allowed"})
			return
		}
		if tdata.SectionAllocated != "" && !HasOnlyAlphabets(tdata.SectionAllocated) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid section provided"})
			return
		}
		if tdata.SubAllocated != 0 && (tdata.SubAllocated < 0 || tdata.SubAllocated > 99999999) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject it provided"})
			return
		}
		// fmt.Println("flag 0", tdata.SubAllocated)
		if tdata.SubAllocated != 0 {
			var amt2 int
			if err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE subId=?", tdata.SubAllocated).Scan(&amt2); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if amt2 <= 0 {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject doesnot exist you want to assign to teacher"})
				return
			}
		}
		if err = db.QueryRow("SELECT * FROM teachers WHERE tId=?", tdata.TId).Scan(&defaultData.TId, &defaultData.Tpwd, &defaultData.Role, &defaultData.Name, &defaultData.SubAllocated, &defaultData.StdAllocated, &defaultData.SectionAllocated); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() + "----------------from here"})
			return
		} else if err == sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "teacher not found to edit"})
			return
		}
		if tdata.SectionAllocated != "" && tdata.StdAllocated == 0 && (defaultData.StdAllocated.Int64 == 0 || !defaultData.StdAllocated.Valid) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "if you allocate section, standard is needed"})
			return
		}
		if tdata.SectionAllocated == "" && tdata.StdAllocated != 0 && (!defaultData.SectionAllocated.Valid || defaultData.SectionAllocated.String == "") {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "if you allocate standard, section is needed"})
			return
		}
		if defaultData.SubAllocated.Valid && defaultData.SubAllocated.Int64 == 0 && tdata.SubAllocated != 0 && ((tdata.SectionAllocated == "" && defaultData.SectionAllocated.Valid && defaultData.SectionAllocated.String == "") || (tdata.StdAllocated == 0 && defaultData.StdAllocated.Valid && defaultData.StdAllocated.Int64 == 0)) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "pls assign std and section if you are assigning subject else you wont be able to calculate teacher's performance"})
			return
		}
		if tdata.Name == defaultData.Name {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "new name = old name, not valid"})
			return
		}
		if tdata.Tpwd == defaultData.Tpwd {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "new pwd = old pwd, not valid"})
			return
		}
		if defaultData.SectionAllocated.Valid && tdata.SectionAllocated == defaultData.SectionAllocated.String && defaultData.SectionAllocated.String != "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "new section = old section, not valid"})
			return
		}
		if defaultData.SubAllocated.Valid && tdata.StdAllocated == int(defaultData.StdAllocated.Int64) && defaultData.StdAllocated.Int64 != 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "new std = old std, not valid"})
			return
		}
		if defaultData.SubAllocated.Valid && tdata.SubAllocated == int(defaultData.SubAllocated.Int64) && defaultData.SubAllocated.Int64 != 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "new subject = old subject, not valid"})
			return
		}
		dbstr := "UPDATE teachers SET "
		var constraints []string
		if tdata.Name != "" {
			constraints = append(constraints, ("tName = '"+tdata.Name)+"'")
		}
		if tdata.Tpwd != "" {
			constraints = append(constraints, ("tPwd = '"+tdata.Tpwd)+"'")
		}

		// fmt.Println("flag 01", tdata.SubAllocated)
		// fmt.Println("flag 1", constraints)
		if tdata.SubAllocated != 0 {
			constraints = append(constraints, ("subId = " + strconv.Itoa(tdata.SubAllocated)))
		}
		// fmt.Println("flag 2", constraints)
		if tdata.SectionAllocated != "" {
			if tdata.StdAllocated != 0 {
				constraints = append(constraints, ("stdAllocated = " + strconv.Itoa(tdata.StdAllocated) + ", " + "sectionAllocated = '" + tdata.SectionAllocated + "'"))
			}
		}
		if len(constraints) <= 0 {
			ctx.JSON(http.StatusOK, gin.H{"output": "you didnot requested any changes"})
			return
		} else {
			if len(constraints) > 0 {
				count := 0
				for i, v := range constraints {
					if count == 0 {
						count++
					}
					dbstr += v
					if count > 0 && i != len(constraints)-1 {
						fmt.Println((len(constraints) - 1), "-", i, "-", count, constraints)
						dbstr += ", "
					}
				}
				dbstr += " "
			}
		}
		dbstr += ("WHERE tId = '" + tdata.TId + "'")
		if _, err = db.Exec(dbstr); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error() + dbstr})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "UPDATED SUCCESSFULLY"})
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
		return
	}
}
func SetSubLimit(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	}
	if role == "admin" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		defer db.Close()

		var limitData struct {
			Standard int `json:"std" binding:"required"`
			SubLimit int `json:"limit" binding:"required"`
		}
		if err = ctx.ShouldBindJSON(&limitData); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if limitData.Standard == 0 || limitData.SubLimit == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide standard and limit accurately"})
			return
		}
		if limitData.Standard != 0 && (limitData.Standard < 1 || limitData.Standard > 12) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide standard between 1 and 12"})
			return
		}
		if limitData.SubLimit != 0 && limitData.SubLimit < 1 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide positive limit"})
			return
		}
		if _, err = db.Exec("INSERT INTO subjectAllocation (std,subject_limit) VALUES (?,?)", limitData.Standard, limitData.SubLimit); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "limit set successfully"})
		return
	}
}
