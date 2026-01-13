package migration

import (
	"database/sql"
	"log"
	"net/http"

	"example.com/main/database"
	"github.com/gin-gonic/gin"
)

func RemoveUnwantedData(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || (role != "teacher" && role != "admin") {

		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorised access"})
		return
	} else {
		var dsn = database.InitDb()
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		defer db.Close()
		if _, err := db.Exec("set foreign_key_checks=0"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("DELETE FROM students WHERE grNo = 999 OR grNo=9090 OR grNo>90000"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("DELETE FROM teachers WHERE tId = 999 OR tId=9090"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("DELETE FROM admins WHERE admin_id = 9090"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("DELETE FROM subjects WHERE subId = 99 OR subId=99090"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if role == "admin" {
			if _, err = db.Exec("DELETE FROM subjectAllocation WHERE std != 1"); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
		if _, err = db.Exec("TRUNCATE reviews"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("TRUNCATE pendingApplications"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("TRUNCATE marks"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if _, err := db.Exec("set foreign_key_checks=0"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "unwanted data removed"})
	}
}

func RemoveDummyData(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || (role != "teacher" && role != "admin") {

		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorised access"})
		return
	} else {
		var dsn = database.InitDb()
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		defer db.Close()
		if _, err := db.Exec("set foreign_key_checks=0"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if _, err = db.Exec("TRUNCATE students"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if role != "admin" {
			log.Println("in admin remove dummy")
			if _, err = db.Exec("TRUNCATE subjectAllocation"); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
		}
		if _, err = db.Exec("TRUNCATE reviews"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("TRUNCATE pendingApplications"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("TRUNCATE marks"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		// } else {
		if _, err = db.Exec("TRUNCATE students"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("TRUNCATE subjects"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		// }
		if _, err = db.Exec("DELETE FROM teachers WHERE tId < 10000000"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("DELETE FROM subjects WHERE subId < 10000000"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("DELETE FROM admins WHERE admin_id < 10000000"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("TRUNCATE reviews"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("TRUNCATE pendingApplications"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if _, err = db.Exec("TRUNCATE marks"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}

		if _, err := db.Exec("set foreign_key_checks=0"); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "dummy data removed"})
	}
}
