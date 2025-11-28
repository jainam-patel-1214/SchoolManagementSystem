package teacher

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

type TeacherSubAllocation struct {
	Tid     int
	SubId   int
	Section string
}
type ReturnMsg struct {
	Code    int
	Status  string
	Message string
}
type TeacherInfo struct {
	Tid            int    `json:"id" binding:"required"`
	Name           string `json:"name" binding:"required"`
	ClassAllocated string `json:"clasTeacher" binding:"required"`
}

func HasOnlyAlphabets(s string) bool {
	for i, r := range s {
		if unicode.IsSpace(r) {
			continue
		}
		if !unicode.IsLetter(r) {
			fmt.Println(i)
			return false
		}
	}
	return true
}

func AddStudent(ctx *gin.Context) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	} else {
		var studentData struct {
			GR_NO       int    `json:"grNo" binding:"required"`
			StudentPwd  string `json:"studPwd" binding:"required"`
			UserRole    string `json:"userRole" binding:"required"`
			StudentName string `json:"studName" binding:"required"`
			Std         int    `json:"std" binding:"required"`
			Section     string `json:"section" binding:"required"`
		}
		err = ctx.ShouldBindJSON(&studentData)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "cannot read body"})
			return
		}
		if studentData.GR_NO > 99999999 || studentData.GR_NO <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		var amt int
		if err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo=?", studentData.GR_NO).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if amt > 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "student already exist with gr number provided, try updating student details"})
			return
		}
		if len(studentData.StudentPwd) != 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide valid password of length of 8 characters"})
			return
		}
		if studentData.StudentPwd == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide password"})
			return
		}
		if studentData.UserRole != "student" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "student user role required"})
			return
		}
		if studentData.StudentName == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide name of student"})
			return
		}
		if !HasOnlyAlphabets(studentData.StudentName) && studentData.StudentName != "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "symbols/digits not allowed in student name"})
			return
		}
		if studentData.Std == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "standard not provided, it shall be from 1 to 12"})
			return
		}
		if studentData.Section == "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "section not provided"})
			return
		}
		if studentData.Std < 0 || studentData.Std > 12 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "standard shall be from 1 to 12"})
			return
		}
		if len(studentData.Section) < 1 || len(studentData.Section) > 2 || !HasOnlyAlphabets(studentData.Section) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid section"})
			return
		}
		_, err = db.Exec("INSERT INTO students (grNo, sPwd, userRole, studName, std, section) VALUES (?,?,?,?,?,?)", studentData.GR_NO, studentData.StudentPwd, studentData.UserRole, studentData.StudentName, studentData.Std, studentData.Section)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while inserting into db"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "student created"})
	}
}

func EditStud(ctx *gin.Context) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	} else {
		type EditBody struct {
			GR_NO       int    `json:"grNo" binding:"required"`
			StudentPwd  string `json:"studPwd"`
			UserRole    string `json:"userRole"`
			StudentName string `json:"studName"`
			Std         int    `json:"std"`
			Section     string `json:"section"`
		}
		var editBody EditBody
		err = ctx.BindJSON(&editBody)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while processing data"})
			return
		}
		if editBody.GR_NO == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		if editBody.GR_NO > 99999999 || editBody.GR_NO < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		var amt int
		if err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo=?", editBody.GR_NO).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "student doesnt exist with gr number provided, try creating student"})
			return
		}
		if len(editBody.StudentPwd) != 8 && editBody.StudentPwd != "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "password length of 8 characters needed"})
			return
		}
		if editBody.UserRole != "" && editBody.UserRole != "student" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "student user role required"})
			return
		}
		if editBody.StudentName != "" && !HasOnlyAlphabets(editBody.StudentName) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "please accurate name of student"})
			return
		}
		if editBody.Std != 0 && (editBody.Std < 1 || editBody.Std > 12) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "standard shall be from 1 to 12"})
			return
		}
		if editBody.Section != "" && (len(editBody.Section) < 1 || len(editBody.Section) > 2 || !HasOnlyAlphabets(editBody.Section)) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "accurate section not provided"})
			return
		}

		var defaultData EditBody
		err = db.QueryRow("SELECT * FROM students WHERE grNo=?", editBody.GR_NO).Scan(&defaultData.GR_NO, &defaultData.StudentPwd, &defaultData.UserRole, &defaultData.StudentName, &defaultData.Std, &defaultData.Section)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while processing data"})
			return
		}
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "student not found to edit"})
			return
		}
		dbstr := "UPDATE students SET "
		var conditions []string
		fmt.Println(editBody, "-----------------", defaultData)
		if editBody.StudentPwd != defaultData.StudentPwd && editBody.StudentPwd != "" {
			conditions = append(conditions, ("sPwd = '" + editBody.StudentPwd + "'"))
			fmt.Println(conditions)
		}
		if editBody.StudentName != defaultData.StudentName && editBody.StudentName != "" && HasOnlyAlphabets(editBody.StudentName) {
			conditions = append(conditions, ("studName = '" + editBody.StudentName + "'"))
		}
		if editBody.Std != 0 && editBody.Std != defaultData.Std && editBody.Std <= 12 && editBody.Std > 0 {
			conditions = append(conditions, ("std = " + strconv.Itoa(editBody.Std)))
		}
		if editBody.Section != defaultData.Section && editBody.Section != "" && HasOnlyAlphabets(editBody.Section) {
			conditions = append(conditions, ("section = '" + editBody.Section + "'"))
		}
		fmt.Println("length of cond", conditions, len(conditions))
		for i, v := range conditions {
			dbstr += v
			if i != len(conditions)-1 {
				dbstr += ","
			}
		}
		dbstr += (" WHERE grNo = " + strconv.Itoa(editBody.GR_NO))
		fmt.Println("length of cond", conditions, len(conditions))
		if len(conditions) > 0 {
			_, err = db.Exec(dbstr)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while updating db"})
				return
			}
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "pls provide new vals to update"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "student updated successfully"})
		return
	}
}

func CreateSub(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	if role == "teacher" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cannot connect to db"})
			return
		}
		defer db.Close()
		var subInfo struct {
			SubId    int    `json:"subId" binding:"required"`
			SubName  string `json:"subName" binding:"required"`
			LevelStd int    `json:"levelStd" binding:"required"`
			Credits  int    `json:"credits" binding:"required"`
		}
		if err = ctx.ShouldBindJSON(&subInfo); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error processing data"})
			return
		}

		if subInfo.SubId <= 0 || subInfo.SubId > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id, pls enter max 8 digit id"})
			return
		}
		var amt int
		if err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE subId=?", subInfo.SubId).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if amt > 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject already exist with id provided, try updating subject details"})
			return
		}
		if subInfo.SubName == "" || len(subInfo.SubName) > 50 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject name, pls provide name upto 50 chars"})
			return
		}
		if subInfo.LevelStd <= 0 || subInfo.LevelStd > 12 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "only standard from 1 to 12 are valid"})
			return
		}
		if subInfo.Credits < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "negative credits are not possible"})
			return
		}

		var limit int
		err = db.QueryRow("SELECT subject_limit FROM subjectAllocation WHERE std = ?", subInfo.LevelStd).Scan(&limit)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error processing"})
			return
		}
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("first set limit of subjects allocated in %d standard", subInfo.LevelStd)})
			return
		}
		var count int
		err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE levelStd = ?", subInfo.LevelStd).Scan(&count)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error processing data"})
			return
		}
		if count >= limit {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("limit of subject for standard %d reached", subInfo.LevelStd)})
			return
		}
		if _, err = db.Exec("INSERT INTO subjects (subId,subName,levelStd,credits) VALUES (?,?,?,?)", subInfo.SubId, subInfo.SubName, subInfo.LevelStd, subInfo.Credits); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error inserting data"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "inserted successfully"})
		return
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}
}

func EditSub(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	if role == "teacher" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect db"})
			return
		}
		defer db.Close()
		type EditBody struct {
			SubId    int    `json:"subId" binding:"required"`
			SubName  string `json:"subName"`
			LevelStd int    `json:"levelStd"`
			Credits  int    `json:"credits"`
		}
		var editBody EditBody
		err = ctx.ShouldBindJSON(&editBody)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while processing data"})
			return
		}

		if editBody.SubId <= 0 || editBody.SubId > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id, pls enter max 8 digit id"})
			return
		}
		var amt int
		if err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE subId=?", editBody.SubId).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject doesnot exist with id provided, try creating subject details"})
			return
		}
		if editBody.LevelStd != 0 {
			fmt.Println("being executed", editBody.LevelStd)
			var amt2 int
			if err = db.QueryRow("SELECT COUNT(subId) FROM marks WHERE subId=?", editBody.SubId).Scan(&amt2); err != nil && err != sql.ErrNoRows {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
				return
			}
			if amt2 > 0 {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "Marks are alloted to students associated to subject you want to edit. Cant edit, only delete is possible"})
				return
			}
		}
		if editBody.SubName != "" && len(editBody.SubName) > 50 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject name, pls provide name upto 50 chars"})
			return
		}
		if editBody.LevelStd != 0 && (editBody.LevelStd < 0 || editBody.LevelStd > 12) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "only standard from 1 to 12 are valid"})
			return
		}
		if editBody.Credits < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "negative credits are not possible"})
			return
		}

		var defaultData EditBody
		err = db.QueryRow("SELECT * FROM subjects WHERE subId=?", editBody.SubId).Scan(&defaultData.SubId, &defaultData.SubName, &defaultData.LevelStd, &defaultData.Credits)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while processing data"})
			return
		}
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "no subject found to edit"})
			return
		}
		dbstr := "UPDATE subjects SET "
		changeOccur := false
		var conditions []string
		if editBody.SubId != defaultData.SubId && editBody.SubId != 0 {
			conditions = append(conditions, ("subId = " + strconv.Itoa(editBody.SubId)))
			changeOccur = true
		}
		if editBody.SubName != defaultData.SubName && editBody.SubName != "" {
			conditions = append(conditions, ("subName = '" + editBody.SubName + "'"))
			changeOccur = true
		}
		if editBody.LevelStd != 0 && editBody.LevelStd != defaultData.LevelStd && editBody.LevelStd <= 12 && editBody.LevelStd > 0 {
			conditions = append(conditions, ("levelStd = " + strconv.Itoa(editBody.LevelStd)))
			changeOccur = true
		}
		if editBody.Credits != defaultData.Credits {
			conditions = append(conditions, ("credits = " + strconv.Itoa(editBody.Credits)))
			changeOccur = true
		}
		for i, v := range conditions {
			dbstr += v
			if i != len(conditions)-1 {
				dbstr += ","
			}
		}
		dbstr += (" WHERE subId = " + strconv.Itoa(editBody.SubId))
		if changeOccur {
			_, err = db.Exec(dbstr)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while updating db"})
				return
			}
			ctx.JSON(http.StatusOK, gin.H{"output": "subject updated successfully"})
			return
		} else {
			ctx.JSON(http.StatusOK, gin.H{"output": "no change occured"})
			return
		}
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}
}

func EnterMarks(ctx *gin.Context) {

	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	if role == "teacher" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cannot connect to db"})
			return
		}
		defer db.Close()
		var marks struct {
			GrNo           int `json:"grNo" binding:"required"`
			SubId          int `json:"subId" binding:"required"`
			TheoryMarks    int `json:"theoryMarks" binding:"required"`
			PracticalMarks int `json:"practicalMarks" binding:"required"`
		}
		if err = ctx.ShouldBindJSON(&marks); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if marks.GrNo <= 0 || marks.GrNo > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no., pls enter max 8 digit id"})
			return
		}
		if marks.SubId <= 0 || marks.SubId > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id"})
			return
		}
		if marks.TheoryMarks < 0 || marks.TheoryMarks > 80 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide theory marks between 0 & 80"})
			return
		}
		if marks.PracticalMarks < 0 || marks.PracticalMarks > 20 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide practical marks between 0 & 20"})
			return
		}
		var amountstud int
		err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo = ?", marks.GrNo).Scan(&amountstud)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amountstud <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "student not exist whom you want to add marks"})
			return
		}
		var amountsub int
		err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE subId = ?", marks.SubId).Scan(&amountsub)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amountsub <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject not exist whom you want to add marks"})
			return
		}
		var amount int
		err = db.QueryRow("SELECT COUNT(grNo) FROM marks WHERE grNo = ? AND subId = ?", marks.GrNo, marks.SubId).Scan(&amount)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amount > 0 {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "record already present please try updating it"})
			return
		}
		var stdSt int
		var stdSub int
		err = db.QueryRow("SELECT std FROM students WHERE grNo = ?", marks.GrNo).Scan(&stdSt)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		err = db.QueryRow("SELECT levelStd FROM subjects WHERE subId = ?", marks.SubId).Scan(&stdSub)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if stdSt != stdSub {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "either check student or check subject you are trying to enter marks because both field's standard doesnot match"})
			return
		}
		if _, err = db.Exec("INSERT INTO marks (grNo,subId,theoryM,practicalM,grade) VALUES (?,?,?,?,?)", marks.GrNo, marks.SubId, marks.TheoryMarks, marks.PracticalMarks, gradeCalculator(marks.TheoryMarks+marks.PracticalMarks)); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error inserting data"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "inserted successfully"})
		return
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

}
func EditMarks(ctx *gin.Context) {

	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	if role == "teacher" {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect db"})
			return
		}
		defer db.Close()
		type marks struct {
			GrNo           int `json:"grNo" binding:"required"`
			SubId          int `json:"subId" binding:"required"`
			TheoryMarks    int `json:"theoryMarks"`
			PracticalMarks int `json:"practicalMarks"`
		}
		var editBody marks
		var tempgrade string
		err = ctx.ShouldBindJSON(&editBody)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while processing data"})
			return
		}
		if editBody.GrNo <= 0 || editBody.GrNo > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no., pls enter max 8 digit id"})
			return
		}
		if editBody.SubId <= 0 || editBody.SubId > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id"})
			return
		}
		if editBody.TheoryMarks != 0 {
			if editBody.TheoryMarks < 0 || editBody.TheoryMarks > 80 {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide theory marks between 0 & 80"})
				return
			}
		}
		if editBody.PracticalMarks != 0 {
			if editBody.PracticalMarks < 0 || editBody.PracticalMarks > 20 {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "provide practical marks between 0 & 20"})
				return
			}
		}
		var amountstud int
		err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo = ?", editBody.GrNo).Scan(&amountstud)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amountstud <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "student not exist whom you want to edit marks"})
			return
		}
		var amountsub int
		err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE subId = ?", editBody.SubId).Scan(&amountsub)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amountsub <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject not exist whom you want to edit marks"})
			return
		}
		var amount int
		err = db.QueryRow("SELECT COUNT(grNo) FROM marks WHERE grNo = ? AND subId = ?", editBody.GrNo, editBody.SubId).Scan(&amount)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amount <= 0 {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "record not present please try inserting it first"})
			return
		}
		var defaultData marks
		err = db.QueryRow("SELECT * FROM marks WHERE grNo=? AND subId=?", editBody.GrNo, editBody.SubId).Scan(&defaultData.GrNo, &defaultData.SubId, &defaultData.TheoryMarks, &defaultData.PracticalMarks, &tempgrade)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "such grno and subject id combination entry not found"})
			return
		}
		dbstr := "UPDATE marks SET "
		changeOccur := false
		var conditions []string
		if editBody.TheoryMarks != defaultData.TheoryMarks && editBody.TheoryMarks <= 80 && editBody.TheoryMarks > 0 {
			conditions = append(conditions, ("theoryM = " + strconv.Itoa(editBody.TheoryMarks)))
			changeOccur = true
		}
		if editBody.PracticalMarks != defaultData.PracticalMarks && editBody.PracticalMarks <= 20 && editBody.PracticalMarks > 0 {
			conditions = append(conditions, ("practicalM = " + strconv.Itoa(editBody.PracticalMarks)))
			changeOccur = true
		}
		needComma := false
		for i, v := range conditions {
			dbstr += v
			needComma = true
			if i != len(conditions)-1 {
				dbstr += ","
			}
		}
		if needComma {
			dbstr += ","
		}
		if changeOccur {
			dbstr += fmt.Sprintf(" grade = '%s' ", gradeCalculator(editBody.TheoryMarks+editBody.PracticalMarks))
		}
		dbstr += fmt.Sprintf("WHERE grNo = %s AND subId = %s", strconv.Itoa(editBody.GrNo), strconv.Itoa(editBody.SubId))
		fmt.Println(dbstr)
		if changeOccur {
			_, err = db.Exec(dbstr)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while updating db"})
				return
			}
			ctx.JSON(http.StatusOK, gin.H{"output": "student updated successfully"})
			return
		} else {
			ctx.JSON(http.StatusOK, gin.H{"output": "no changes specified"})
			return
		}
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

}

func AddReviews(ctx *gin.Context) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	tid, exist := ctx.Get("UiD")
	if !exist || tid == nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error retrieving your id"})
		return
	}
	var reviewInfo struct {
		StudId  int    `json:"grNo" binding:"required"`
		Comment string `json:"comment" binding:"required"`
	}
	err = ctx.ShouldBindJSON(&reviewInfo)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "invalid data sent"})
	}
	var amount int
	err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo = ?", reviewInfo.StudId).Scan(&amount)
	if err != nil && err != sql.ErrNoRows {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if amount <= 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "no such student found"})
		return
	}
	var amt int
	err = db.QueryRow("SELECT COUNT(grNo) FROM reviews WHERE grNo = ? AND tId = ?", reviewInfo.StudId, tid.(string)).Scan(&amt)
	if err != nil && err != sql.ErrNoRows {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	if amt == 1 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "you can only enter comment once"})
		return
	}
	if reviewInfo.StudId <= 0 || reviewInfo.StudId > 99999999 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no., pls enter max 8 digit id"})
		return
	}
	if reviewInfo.Comment == "" || len(reviewInfo.Comment) > 255 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "please enter comment upto 250 chars allowed"})
		return
	}

	if _, err := db.Exec("INSERT INTO reviews (tId, grNo, comment) VALUES (?,?,?)", tid.(string), reviewInfo.StudId, reviewInfo.Comment); err != nil {
		fmt.Println(err)
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while inserting error"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"output": "added successfully"})
}

func Performance(ctx *gin.Context) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	tid, exist := ctx.Get("UiD")
	if !exist || tid == nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error setting your id"})
		return
	}
	res := db.QueryRow("SELECT subId,stdAllocated FROM teachers WHERE tId = ?", tid)
	var std int
	var stda int
	if err = res.Scan(&std, &stda); std == 0 || stda == 0 {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "subject/std is not allocated to teacher whose performance you requested. thus no performance can be fetched"})
		return
	} else if err != nil && err != sql.ErrNoRows {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	} else if err == sql.ErrNoRows {
		ctx.JSON(http.StatusNotFound, gin.H{"error": "subject/std is not allocated to teacher whose performance you requested. thus no performance can be fetched"})
		return
	}

	type Teachers struct {
		Tid                 string
		TName               string
		StdAllocated        int
		SubName             string
		TotalTheoryMarks    int
		TotalPracticalMarks int
	}
	var result []Teachers
	res2, err := db.Query("SELECT tId FROM teachers WHERE stdAllocated=? AND subId IS NOT NULL", stda)
	if err != nil {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong hwile fetching db"})
		return
	}
	var tempres Teachers
	for res2.Next() {
		var temp any
		err = res2.Scan(&temp)
		if err != nil {
			fmt.Println("cannot scan", err)
		} else {
			res3, err := db.Query("SELECT t.tId, t.tName, t.stdAllocated, s.subName, SUM(m.theoryM) AS totalTheory, SUM(m.practicalM) AS totalPractical FROM marks m LEFT JOIN teachers t ON m.subId = t.subId INNER JOIN subjects s ON t.subId = s.subId WHERE t.tId = ? GROUP BY t.tId, t.tName, t.stdAllocated, s.subName", temp)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if res3.Next() {
				err = res3.Scan(&tempres.Tid, &tempres.TName, &tempres.StdAllocated, &tempres.SubName, &tempres.TotalTheoryMarks, &tempres.TotalPracticalMarks)
				if err != nil {
					fmt.Println("error finding data", err)
					return
				}
				result = append(result, tempres)
			}
		}
	}
	if len(result) == 0 {
		ctx.JSON(http.StatusOK, gin.H{"output": "no results found"})
		return
	}
	fmt.Println(result)
	ctx.JSON(http.StatusOK, gin.H{"output": result})
}

func DelStud(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		fmt.Println("no token found")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	}
	if role == "teacher" {
		var stdGrno struct {
			GRno int `json:"grNo" binding:"required"`
		}
		if err := ctx.ShouldBindJSON(&stdGrno); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "unable to read body"})
			return
		}

		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		if stdGrno.GRno <= 0 || stdGrno.GRno > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid student id entered for deletion"})
			return
		}
		if stdGrno.GRno != 0 {
			var amt int
			if err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo=?", stdGrno.GRno).Scan(&amt); err != nil && err != sql.ErrNoRows {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if amt <= 0 {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "student to be deleted doesnot exist, please enter existing gr no"})
				return
			}
		}
		defer db.Close()
		if _, err = db.Exec("DELETE FROM students WHERE grNo = ?", stdGrno.GRno); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error in DB, cant delete"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "DELETED SUCCESSFULLY"})
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
		return
	}
}

func DelSub(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
		fmt.Println("no token found")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	}
	if role == "teacher" {
		var subid struct {
			SubId int `json:"subId" binding:"required"`
		}
		if err := ctx.ShouldBindJSON(&subid); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "unable to read body"})
			return
		}
		if subid.SubId <= 0 || subid.SubId > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject id, pls enter max 8 digit id"})
			return
		}
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
			return
		}
		if subid.SubId != 0 {
			var amt int
			if err = db.QueryRow("SELECT COUNT(subId) FROM subjects WHERE subId=?", subid.SubId).Scan(&amt); err != nil && err != sql.ErrNoRows {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
				return
			}
			if amt <= 0 {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject to be deleted doesnot exist, please enter existing subject id"})
				return
			}
		}
		if _, err = db.Exec("DELETE FROM subjects WHERE subId = ?", subid.SubId); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "DELETED SUCCESSFULLY"})

	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
		return
	}
}

func Report(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "teacher" {
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
			TeacherId   string `json:"tId"`
			TeacherName string `json:"tName"`
			Comment     string `json:"comment"`
		}
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect to db"})
			return
		}
		defer db.Close()
		var studParam struct {
			GR_NO int `json:"grNo" binding:"required"`
		}
		if err = ctx.ShouldBindJSON(&studParam); err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error occured while reading params"})
			return
		}
		if studParam.GR_NO == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		if studParam.GR_NO > 99999999 || studParam.GR_NO < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		var amt int
		if err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo=?", studParam.GR_NO).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "student doesnot exist, please enter valid gr no"})
			return
		}
		temp := studParam.GR_NO
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
	if !exist || role != "teacher" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	} else {
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant connect to db"})
			return
		}
		defer db.Close()

		tid, exist := ctx.Get("UiD")
		if !exist || tid == 0 {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "id not found"})
			return
		}
		temp := fmt.Sprintf("%v", tid)
		fmt.Println("useriddddd", tid, temp)

		var otpt struct {
			Id       string
			Password string
			Name     string
			SubId    int
			Std      int
			Section  string
		}
		err = db.QueryRow("SELECT t.tId,t.tPwd,t.tName,t.subId,t.stdAllocated,t.sectionAllocated FROM teachers t WHERE t.tId=?", temp).Scan(&otpt.Id, &otpt.Password, &otpt.Name, &otpt.SubId, &otpt.Std, &otpt.Section)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		fmt.Println("PPPPL", otpt)
		ctx.JSON(http.StatusOK, gin.H{"output": otpt})
	}
}

func gradeCalculator(n int) string {
	if n > 90 {
		return "AA"
	} else if n > 80 && n <= 90 {
		return "AB"
	} else if n > 70 && n <= 80 {
		return "BB"
	} else if n > 60 && n <= 70 {
		return "BC"
	} else if n > 50 && n <= 60 {
		return "CC"
	} else if n > 40 && n <= 50 {
		return "CD"
	} else if n > 30 && n <= 40 {
		return "DD"
	}
	return "FF"
}
