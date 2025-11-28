package middleware

import (
	"database/sql"
	"net/http"

	"github.com/gin-gonic/gin"
)

func DelCookie(ctx *gin.Context) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, err)
		return
	}
	defer db.Close()
	var tokenData struct {
		Token string `json:"token" binding:"required"`
	}
	if err = ctx.ShouldBindJSON(&tokenData); err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cannot receive token"})
		return
	}
	dbout, err := db.Exec("DELETE FROM activeSessions WHERE sessiontoken = ?", tokenData.Token)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Could not process session deletion"})
		return
	}
	if i, err := dbout.RowsAffected(); err == nil && i != 0 {
		ctx.JSON(http.StatusOK, gin.H{"output": "logout successful"})
	} else {
		ctx.JSON(http.StatusInternalServerError, gin.H{"output": "issue occured please try again"})
	}
}
