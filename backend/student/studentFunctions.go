package student

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"unicode"

	"example.com/main/database"
	"github.com/gin-gonic/gin"
	_ "github.com/go-sql-driver/mysql"
)

var dsn = database.InitDb()

type TeacherInfo struct {
	ID      int    `json:"id" binding:"required"`
	Name    string `json:"name" binding:"required"`
	Subject string `json:"subject" binding:"required"`
	ClassID string `json:"classId" binding:"required"`
}

type ReturnMsg struct {
	Code    int    `json:"statusCode" binding:"required"`
	Status  string `json:"status" binding:"required"`
	Message string `json:"response"`
}

type StudentInfo struct {
	RollNo      int    `json:"rollNo" binding:"required"`
	Name        string `json:"name" binding:"required"`
	MathsMark   int    `json:"mathsMark" binding:"required"`
	ScienceMark int    `json:"scienceMark" binding:"required"`
	EnglishMark int    `json:"englishMark" binding:"required"`
	ClassID     string `json:"classId" binding:"required"`
}

type DisplayConditions struct {
	ViewByStd     int    `json:"viewByStd" binding:"required"`
	ViewBySection string `json:"viewBySection"`
	MinPercent    int    `json:"minPercent"`
	MaxPercent    int    `json:"maxPercent"`
}

func HasOnlyAlphabets(s string) bool {
	for _, r := range s {
		if unicode.IsSpace(r) {
			continue
		}
		if !unicode.IsLetter(r) {
			return false
		}
	}
	return true
}

func DisplayStudents(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "student" {
		fmt.Println("no token found")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	} else {
		var constraints DisplayConditions
		constraints.MaxPercent, _ = strconv.Atoi(ctx.Query("maxPercent"))
		constraints.MinPercent, _ = strconv.Atoi(ctx.Query("minPercent"))
		constraints.ViewBySection = ctx.Query("viewBySection")
		constraints.ViewByStd, _ = strconv.Atoi(ctx.Query("viewByStd"))
		if constraints.MaxPercent > 100 || constraints.MaxPercent < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "max percent shall be within range of 0 and 100"})
			return
		}
		if constraints.MinPercent > 100 || constraints.MinPercent < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "min percent shall be within range of 0 and 100"})
			return
		}
		if constraints.ViewByStd > 12 || constraints.ViewByStd <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "only standards from 1 to 12 are available + it is compulsory to provide standard"})
			return
		}
		if len(constraints.ViewBySection) > 2 || !HasOnlyAlphabets(constraints.ViewBySection) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid section"})
			return
		}
		dbstr := "SELECT s.studName, s.std, s.section, sub.subName, m.theoryM, m.practicalM, m.grade FROM students s RIGHT JOIN marks m ON s.grNo = m.grNo INNER JOIN subjects sub ON m.subId = sub.subId"
		count := 0
		if constraints.ViewByStd != 0 {
			if count == 0 {
				dbstr += " WHERE "
				count++
			}
			dbstr += "s.std = " + strconv.Itoa(constraints.ViewByStd)
		}
		if constraints.ViewBySection != "" && constraints.ViewBySection != "null" {
			if count == 0 {
				dbstr += " WHERE "
				count++
			} else if count > 0 {
				dbstr += " AND "
			}
			dbstr += "s.section = " + "'" + constraints.ViewBySection + "'"
		}
		if constraints.MinPercent != 0 {
			if count == 0 {
				dbstr += " WHERE "
				count++
			} else if count > 0 {
				dbstr += " AND "
			}
			dbstr += "(m.theoryM+m.practicalM) > " + strconv.Itoa(constraints.MinPercent)
		}
		if constraints.MaxPercent != 0 {
			if count == 0 {
				dbstr += " WHERE "
				count++
			} else if count > 0 {
				dbstr += " AND "
			}
			dbstr += "(m.theoryM + m.practicalM) < " + strconv.Itoa(constraints.MaxPercent)
		}
		fmt.Println(dbstr)

		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Cannot open DB: %v", err)})
			return
		}
		defer db.Close()

		// Make sure connection works
		if err := db.Ping(); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Cannot ping DB: %v", err)})
			return
		}

		res, err := db.Query(dbstr)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("Query failed: %v", err)})
			return
		}
		defer res.Close()

		type output struct {
			SName     string `json:"studentName"`
			SSection  string `json:"section"`
			SubName   string `json:"subject"`
			Grade     string `json:"grade"`
			SStd      int    `json:"standard"`
			Theory    int    `json:"theoryMarks"`
			Practical int    `json:"practicalMarks"`
		}
		var queryres []output
		for res.Next() {
			var record output
			if err := res.Scan(&record.SName, &record.SStd, &record.SSection, &record.SubName, &record.Theory, &record.Practical, &record.Grade); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot read database results"})
				return
			}
			queryres = append(queryres, record)
		}
		if len(queryres) == 0 {
			ctx.JSON(http.StatusOK, gin.H{"output": "no result found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": queryres})
		return
	}
}

func DisplaySubject(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || (role != "student" && role != "teacher" && role != "admin") {
		fmt.Println("no token found")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	}
	if role == "student" || role == "teacher" || role == "admin" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		defer db.Close()
		var constraints struct {
			Std int
		}
		constraints.Std, err = strconv.Atoi(ctx.Query("std"))
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "inappropriate query value"})
			return
		}
		if constraints.Std > 12 || constraints.Std <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "only standards ranging from 1 to 12 are available"})
			return
		}
		var amt int
		if err := db.QueryRow("SELECT COUNT(std) FROM subjectAllocation WHERE std=?", constraints.Std).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "no limit have been set for this std thus there are no subjects"})
			return
		}
		dbstr := "SELECT * FROM subjects WHERE levelStd = " + strconv.Itoa(constraints.Std)
		fmt.Println(dbstr)

		res, err := db.Query(dbstr)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch from db"})
			return
		}
		type output struct {
			SubId   int    `json:"subjectId"`
			SubName string `json:"subjectName"`
			Std     int    `json:"level"`
			Credits int    `json:"credits"`
		}
		var queryres []output
		for res.Next() {
			var record output
			if err := res.Scan(&record.SubId, &record.SubName, &record.Std, &record.Credits); err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot read database results"})
				return
			}
			queryres = append(queryres, record)
		}
		if len(queryres) == 0 {
			ctx.JSON(http.StatusOK, gin.H{"output": "no subjects found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": queryres})
		return
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
	}
}

func Report(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "student" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	} else {
		type MarkJson struct {
			SubjectId     int    `json:"subId"`
			Subject       string `json:"subjectName"`
			TheoryMark    int    `json:"theoryMM"`
			PracticalMark int    `json:"practicalMM"`
			Grade         string `json:"grade"`
		}
		type Comments struct {
			TeacherId   int    `json:"tId"`
			TeacherName string `json:"tName"`
			Comment     string `json:"comment"`
		}
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect to db"})
			return
		}
		defer db.Close()

		searchParam, exist := ctx.Get("UiD")
		if !exist || searchParam == 0 {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "id not found"})
			return
		}
		temp := fmt.Sprintf("%v", searchParam)
		tc, err := db.Begin()
		if err != nil {
			log.Fatal(err)
			return
		}
		res1, err := db.Query("SELECT m.subId,s.subName,m.theoryM,m.practicalM,m.grade FROM marks m INNER JOIN subjects s ON s.subId = m.subId WHERE m.grNo = ?", temp)
		if err != nil {
			tc.Rollback()
			log.Fatal(err)
			return
		}
		_, err = tc.Exec("SAVEPOINT query1done")
		if err != nil {
			tc.Rollback()
			log.Fatal("Failed to create savepoint:", err)
		}
		res2, err := db.Query("SELECT r.tId,t.tName,r.comment FROM reviews r INNER JOIN teachers t ON t.tId = r.tId WHERE r.grNo = ?", temp)
		if err != nil {
			_, err = tc.Exec("ROLLBACK TO SAVEPOINT query1done")
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error processing query"})
				return
			}
		}
		if err = tc.Commit(); err != nil {
			log.Fatal("Failed to commit transaction:", err)
		}
		var otpt struct {
			MarkInfo    []MarkJson
			CommentInfo []Comments
		}
		for res1.Next() {
			var tp MarkJson
			err = res1.Scan(&tp.SubjectId, &tp.Subject, &tp.TheoryMark, &tp.PracticalMark, &tp.Grade)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant process query output"})
				return
			}
			otpt.MarkInfo = append(otpt.MarkInfo, tp)
		}
		for res2.Next() {
			var tp Comments
			err = res2.Scan(&tp.TeacherId, &tp.TeacherName, &tp.Comment)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant process query output"})
				return
			}
			otpt.CommentInfo = append(otpt.CommentInfo, tp)
		}
		if len(otpt.CommentInfo) == 0 && len(otpt.MarkInfo) == 0 {
			ctx.JSON(http.StatusOK, gin.H{"output": "no result found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": otpt})
	}
}

func SelfData(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "student" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	} else {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect to db"})
			return
		}
		defer db.Close()

		searchParam, exist := ctx.Get("UiD")
		if !exist || searchParam == 0 {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "id not found"})
			return
		}
		temp := fmt.Sprintf("%v", searchParam)
		// if err != nil {
		// 	log.Fatal(err)
		// 	return
		// }
		type SubjectData struct {
			Subid   int
			Subname string
			Credit  int
		}
		var otpt struct {
			Std      int
			Section  string
			Password string
			SubList  []SubjectData
		}
		err = db.QueryRow("SELECT s.std,s.section,s.sPwd FROM students s WHERE s.grNo=?", temp).Scan(&otpt.Std, &otpt.Section, &otpt.Password)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		res2, err := db.Query("SELECT subId,subName,credits FROM subjects WHERE levelStd = ?", otpt.Std)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error processing query"})
			return
		}
		var allSubDta []SubjectData
		for res2.Next() {
			var tp SubjectData
			err = res2.Scan(&tp.Subid, &tp.Subname, &tp.Credit)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant process query output"})
				return
			}
			allSubDta = append(allSubDta, tp)
		}
		if len(allSubDta) > 0 {
			otpt.SubList = allSubDta
		}
		fmt.Println("PPPPL", otpt)
		ctx.JSON(http.StatusOK, gin.H{"output": otpt})

	}
}
