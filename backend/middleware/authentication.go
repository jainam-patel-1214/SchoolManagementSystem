package middleware

import (
	"database/sql"
	"fmt"

	"log"
	"net/http"
	"strconv"
	"time"

	"example.com/main/database"
	"github.com/golang-jwt/jwt/v5"

	"github.com/gin-gonic/gin"
)

type Session struct {
	Uid       int
	Role      string
	SessionId string
}
type Backup struct {
	Sessions []Session
}
type JwtClaims struct {
	Uid  string
	Role string
	jwt.RegisteredClaims
}

var SessionInfo Backup

var dsn = database.InitDb()

func CreateSession(ctx *gin.Context) {
	// return func(ctx *gin.Context) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}
	defer db.Close()
	var credentials struct {
		UserId   any    `json:"userId"`
		Password string `json:"password"`
	}
	claim := &JwtClaims{}
	idExist := false
	if err := ctx.ShouldBindJSON(&credentials); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}
	switch credentials.UserId.(type) {
	case float64:
		temp := int(credentials.UserId.(float64))
		if temp < 0 || temp > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student id"})
			return
		}

	case string:
		temp := credentials.UserId.(string)
		if len(temp) > 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid teacher/admin id"})
			return
		}
	}
	if credentials.Password != "" && len(credentials.Password) != 8 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid pwd"})
		return
	}
	res, err := db.Query("SELECT grNo, userRole, studName FROM students WHERE grNo=? AND sPwd=? ", credentials.UserId, credentials.Password)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
		return
	}
	temptime := time.Now().Add(24 * time.Hour)
	fmt.Println("time added 1 day", temptime)
	var name string
	var role string
	if res.Next() {
		var grNo int
		err = res.Scan(&grNo, &role, &name)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}
		idExist = true
		fmt.Println("in student")
		claim.Uid = strconv.Itoa(grNo)
		claim.Role = role
		claim.RegisteredClaims.IssuedAt = jwt.NewNumericDate(time.Now())
		claim.RegisteredClaims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(24 * time.Hour))
	} else if !res.Next() {
		res, err = db.Query("SELECT tId, userRole, tName FROM teachers WHERE tId=? AND tPwd=? ", credentials.UserId, credentials.Password)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}
		if res.Next() {
			var tId string
			// var role string
			err = res.Scan(&tId, &role, &name)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
				return
			}
			idExist = true
			fmt.Println("in teacher")
			claim.Uid = tId
			claim.Role = role
			claim.RegisteredClaims.IssuedAt = jwt.NewNumericDate(time.Now())
			claim.RegisteredClaims.ExpiresAt = jwt.NewNumericDate(temptime)
		} else {
			var aId string
			err := db.QueryRow("SELECT admin_id,admin_name FROM admins WHERE admin_id=? AND admin_pwd=? ", credentials.UserId, credentials.Password).Scan(&aId, &name)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "invalid credentials"})
				return
			}
			role = "admin"
			idExist = true
			fmt.Println("in admin")
			claim.Uid = aId
			claim.Role = "admin"
			claim.RegisteredClaims.IssuedAt = jwt.NewNumericDate(time.Now())
			claim.RegisteredClaims.ExpiresAt = jwt.NewNumericDate(temptime)
		}
	}
	if !idExist {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
		return
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claim)
	tokenString, err := token.SignedString([]byte("9tvfPMwMVQHdksYp"))
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Could not generate token"})
		return
	}
	if _, err = db.Exec("INSERT INTO activeSessions (sessiontoken, userRole, validtime) VALUES (?,?,?)", tokenString, claim.Role, temptime); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Could not process session"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"output": tokenString, "username": name, "role": role})

	fmt.Println(claim)
	// fmt.Println(ctx.Cookie("usercookie"))
	// }
}

func ValidateSession() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userCookie, err := ctx.Cookie("token")
		fmt.Println("cookie received - ", userCookie, "error received - ", err)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "token not found"})
			ctx.Abort()
			return
		}
		// t := ctx.Request.CookiesNamed("userCookie")
		// fmt.Println(t)
		if userCookie == "" || len([]byte(userCookie)) < 3 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "token not found"})
			ctx.Abort()
			return
		}
		// fmt.Println(ck, err)
		// userCookie := ck.Value
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "error authorizing token validity"})
			return
		}
		defer db.Close()
		// fmt.Println(userCookie)
		claim := &JwtClaims{}

		token, err := jwt.ParseWithClaims(userCookie, claim, func(t *jwt.Token) (any, error) {
			return []byte("9tvfPMwMVQHdksYp"), nil
		})
		if err != nil || !token.Valid {
			_, err = db.Exec("DELETE FROM activeSessions WHERE sessiontoken=?", userCookie)
			if err != nil {
				log.Fatal("(ValidateSession) error in deleting active session", err)
				return
			}
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invalidx or expired token"})
			return
		}
		if claim.Role != "student" && claim.Role != "teacher" && claim.Role != "admin" {
			fmt.Println("\n\n\n role \n\n", claim.Role)
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invaliddd or expired token provided"})
			return
		}

		unixTime := claim.RegisteredClaims.ExpiresAt.Time
		tmptime := time.Now()
		if tmptime.After(unixTime) {
			_, err = db.Exec("DELETE FROM activeSessions WHERE sessiontoken = ?", userCookie)
			if err != nil {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "error authorizing token validity"})
				return
			}
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "expired token login again"})
			return
		}
		ctx.Set("userrole", claim.Role)
		ctx.Set("UiD", claim.Uid)
		ctx.Next()

	}

}
