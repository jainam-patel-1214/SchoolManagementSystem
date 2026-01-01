package middleware

import (
	"database/sql"

	"log"
	"net/http"
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
	Uid  int
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
		UserId   int    `json:"userId"`
		Password string `json:"password"`
		UserRole string `json:"userRole"`
	}
	claim := &JwtClaims{}
	idExist := false
	if err := ctx.ShouldBindJSON(&credentials); err != nil {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	temp := credentials.UserId
	if temp < 0 || temp > 99999999 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "Invalid student id"})
		return
	}

	if credentials.Password != "" && (len(credentials.Password) < 8 || len(credentials.Password) > 16) {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid pwd, provide password between 8-16 digits"})
		return
	}
	if credentials.UserRole != "student" && credentials.UserRole != "teacher" && credentials.UserRole != "admin" {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid role provided"})
		return
	}
	var name string
	var role string
	temptime := time.Now().Add(24 * time.Hour)
	switch credentials.UserRole {
	case "student":
		res, err := db.Query("SELECT grNo, userRole, studName FROM students WHERE grNo=? AND sPwd=? ", credentials.UserId, credentials.Password)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}
		if res.Next() {
			var grNo int
			err = res.Scan(&grNo, &role, &name)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
				return
			}
			idExist = true
			claim.Uid = grNo
			claim.Role = role
			claim.RegisteredClaims.IssuedAt = jwt.NewNumericDate(time.Now())
			claim.RegisteredClaims.ExpiresAt = jwt.NewNumericDate(time.Now().Add(24 * time.Hour))
		}
	case "teacher":
		res, err := db.Query("SELECT tId, userRole, tName FROM teachers WHERE tId=? AND tPwd=? ", credentials.UserId, credentials.Password)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
			return
		}
		if res.Next() {
			var tId int
			err = res.Scan(&tId, &role, &name)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err})
				return
			}
			idExist = true
			claim.Uid = tId
			claim.Role = role
			claim.RegisteredClaims.IssuedAt = jwt.NewNumericDate(time.Now())
			claim.RegisteredClaims.ExpiresAt = jwt.NewNumericDate(temptime)
		}
	case "admin":
		var aId int
		err := db.QueryRow("SELECT admin_id,admin_name FROM admins WHERE admin_id=? AND admin_pwd=? ", credentials.UserId, credentials.Password).Scan(&aId, &name)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid credentials"})
			return
		}
		role = "admin"
		idExist = true
		claim.Uid = aId
		claim.Role = "admin"
		claim.RegisteredClaims.IssuedAt = jwt.NewNumericDate(time.Now())
		claim.RegisteredClaims.ExpiresAt = jwt.NewNumericDate(temptime)
	default:
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "invalid role"})
		return
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
}

func ValidateSession() gin.HandlerFunc {
	return func(ctx *gin.Context) {
		userCookie, err := ctx.Cookie("token")
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "token not found"})
			ctx.Abort()
			return
		}
		if userCookie == "" || len([]byte(userCookie)) < 3 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "token not found"})
			ctx.Abort()
			return
		}
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "error authorizing token validity"})
			return
		}
		defer db.Close()
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
			ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invaliddd or expired token provided"})
			return
		}
		if token.Valid {
			var count int
			if err = db.QueryRow(`SELECT COUNT(sessionId) FROM activeSessions WHERE sessiontoken=?`, userCookie).Scan(&count); err != nil {
				ctx.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if count < 1 {
				ctx.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "Invaliddd or expired token provided"})
				return
			}
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
