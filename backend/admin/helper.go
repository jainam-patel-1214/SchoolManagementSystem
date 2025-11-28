package admin

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"unicode"

	"github.com/gin-gonic/gin"
)

type DisplayConditions struct {
	ViewByStd     int    `json:"viewByStd"`
	ViewBySection string `json:"viewBySection"`
	MinPercent    int    `json:"minPercent"`
	MaxPercent    int    `json:"maxPercent"`
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

// func DisplayStudents(ctx *gin.Context) {
// 	role, exist := ctx.Get("userrole")
// 	if !exist || (role != "admin" && role != "teacher") {
// 		fmt.Println("no token found")
// 		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
// 		return
// 	}
// 	if role == "admin" || role == "teacher" {
// 		var constraints DisplayConditions
// 		if err := ctx.ShouldBindJSON(&constraints); err != nil {
// 			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid body received"})
// 			return
// 		}
// 		if constraints.MaxPercent > 100 || constraints.MaxPercent < 0 {
// 			ctx.JSON(http.StatusBadRequest, gin.H{"error": "max percent shall be within range of 0 and 100"})
// 			return
// 		}
// 		if constraints.MinPercent != 0 && constraints.MaxPercent != 0 && constraints.MinPercent >= constraints.MaxPercent {
// 			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid mix and max percent combination, min shall be less"})
// 			return
// 		}
// 		if constraints.MinPercent > 100 || constraints.MinPercent < 0 {
// 			ctx.JSON(http.StatusBadRequest, gin.H{"error": "min percent shall be within range of 0 and 100"})
// 			return
// 		}
// 		if constraints.ViewByStd > 12 || constraints.ViewByStd <= 0 {
// 			ctx.JSON(http.StatusBadRequest, gin.H{"error": "only standards ranging from 1 to 12 are available, provide accurate 'viewByStd' in body"})
// 			return
// 		}
// 		if len(constraints.ViewBySection) > 2 || !HasOnlyAlphabets(constraints.ViewBySection) {
// 			ctx.JSON(http.StatusBadRequest, gin.H{"error": "section only has 2 characters"})
// 			return
// 		}
// 		dbstr := "SELECT s.studName, s.std, s.section, sub.subName, m.theoryM, m.practicalM, m.grade FROM students s RIGHT JOIN marks m ON s.grNo = m.grNo INNER JOIN subjects sub ON m.subId = sub.subId"
// 		count := 0
// 		if constraints.ViewByStd != 0 {
// 			if count == 0 {
// 				dbstr += " WHERE "
// 				count++
// 			}
// 			dbstr += "s.std = " + strconv.Itoa(constraints.ViewByStd)
// 		}
// 		if constraints.ViewBySection != "" {
// 			if count == 0 {
// 				dbstr += " WHERE "
// 				count++
// 			} else if count > 0 {
// 				dbstr += " AND "
// 			}
// 			dbstr += "s.section = " + "'" + constraints.ViewBySection + "'"
// 		}
// 		if constraints.MinPercent != 0 {
// 			if count == 0 {
// 				dbstr += " WHERE "
// 				count++
// 			} else if count > 0 {
// 				dbstr += " AND "
// 			}
// 			dbstr += "(m.theoryM+m.practicalM) > " + strconv.Itoa(constraints.MinPercent)
// 		}
// 		if constraints.MaxPercent != 0 {
// 			if count == 0 {
// 				dbstr += " WHERE "
// 				count++
// 			} else if count > 0 {
// 				dbstr += " AND "
// 			}
// 			dbstr += "(m.theoryM + m.practicalM) < " + strconv.Itoa(constraints.MaxPercent)
// 		}
// 		fmt.Println(dbstr)

//			db, err := sql.Open("mysql", dsn)
//			if err != nil {
//				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
//				return
//			}
//			res, err := db.Query(dbstr)
//			if err != nil {
//				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cannot fetch from db"})
//			}
//			defer db.Close()
//			type output struct {
//				SName     string `json:"studentName"`
//				SSection  string `json:"section"`
//				SubName   string `json:"subject"`
//				Grade     string `json:"grade"`
//				SStd      int    `json:"standard"`
//				Theory    int    `json:"theoryMarks"`
//				Practical int    `json:"practicalMarks"`
//			}
//			var queryres []output
//			for res.Next() {
//				var record output
//				if err := res.Scan(&record.SName, &record.SStd, &record.SSection, &record.SubName, &record.Theory, &record.Practical, &record.Grade); err != nil {
//					ctx.JSON(http.StatusInternalServerError, gin.H{"error": "Cannot read database results"})
//					return
//				}
//				queryres = append(queryres, record)
//			}
//			if len(queryres) == 0 {
//				ctx.JSON(http.StatusOK, gin.H{"output": "no results found"})
//				return
//			}
//			ctx.JSON(http.StatusOK, gin.H{"output": queryres})
//			return
//		} else {
//			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized access"})
//		}
//	}

func ListStudents(ctx *gin.Context) {
	role, exists := ctx.Get("userrole")
	if !exists || (role != "teacher" && role != "admin") {
		fmt.Println("no token found")
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

		searchParam, err := strconv.Atoi(ctx.Query("studId"))
		if err != nil || searchParam <= 0 {
			ctx.JSON(http.StatusUnauthorized, gin.H{"error": "id not found"})
			return
		}
		temp := fmt.Sprintf("%v", searchParam)
		tc, err := db.Begin()
		if err != nil {
			log.Fatal(err)
			return
		}
		var student struct {
			Std      int
			Section  string
			Password string
			Name     string
		}
		err = db.QueryRow("SELECT s.studName,s.std,s.section,s.sPwd FROM students s WHERE s.grNo=?", temp).Scan(&student.Name, &student.Std, &student.Section, &student.Password)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
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
			StudData    struct {
				Std      int
				Section  string
				Password string
				Name     string
			}
		}
		otpt.StudData.Name = student.Name
		otpt.StudData.Section = student.Section
		otpt.StudData.Std = student.Std
		otpt.StudData.Password = student.Password
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
		fmt.Println(otpt)
		ctx.JSON(http.StatusOK, gin.H{"output": otpt})
	}
}

func Report(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || (role != "admin" && role != "teacher") {
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
		var Param struct {
			StudentGrNo int `json:"grNo" binding:"required"`
		}
		err = ctx.ShouldBindJSON(&Param)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if Param.StudentGrNo == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id provided"})
			return
		}
		if Param.StudentGrNo < 0 || Param.StudentGrNo > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid id provided"})
			return
		}
		var amount int
		if err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo=?", Param.StudentGrNo).Scan(&amount); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		} else if err == sql.ErrNoRows {
			amount = 0
		}
		if err == sql.ErrNoRows {
			amount = 0
		}
		if amount <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "no such student exists"})
			return
		}
		temp := fmt.Sprintf("%v", Param.StudentGrNo)
		fmt.Println("temp var", temp)
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
				fmt.Println(err)
				// ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant process query output"})
				return
			}
			otpt.MarkInfo = append(otpt.MarkInfo, tp)
		}
		for res2.Next() {
			var tp Comments
			err = res2.Scan(&tp.TeacherId, &tp.TeacherName, &tp.Comment)
			if err != nil {
				fmt.Println(err)
				// ctx.JSON(http.StatusInternalServerError, gin.H{"error": "cant process query output"})
				return
			}
			otpt.CommentInfo = append(otpt.CommentInfo, tp)
		}
		if len(otpt.CommentInfo) == 0 && len(otpt.MarkInfo) == 0 {
			ctx.JSON(http.StatusOK, gin.H{"output": "no result found"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": otpt})
		return
	}
}

func AddStudent(ctx *gin.Context) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
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
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		fmt.Println(studentData)
		if studentData.GR_NO == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		if studentData.GR_NO > 99999999 || studentData.GR_NO < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		var amt int
		if err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo=?", studentData.GR_NO).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if err == sql.ErrNoRows {
			amt = 0
		}
		if amt > 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "student already exist with gr number provided, try updating student details"})
			return
		}
		if len(studentData.StudentPwd) != 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "password length required of 8 characters"})
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
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	} else {
		type EditBody struct {
			GR_No       int    `json:"grNo" binding:"required"`
			StudentPwd  string `json:"studPwd"`
			UserRole    string `json:"userRole"`
			StudentName string `json:"studName"`
			Std         int    `json:"std"`
			Section     string `json:"section"`
		}
		var editBody EditBody
		err = ctx.ShouldBindJSON(&editBody)
		if err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		if editBody.GR_No == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		if editBody.GR_No > 99999999 || editBody.GR_No < 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid gr no provided"})
			return
		}
		var amt int
		if err = db.QueryRow("SELECT COUNT(grNo) FROM students WHERE grNo=?", editBody.GR_No).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "student doesnt exist with gr number provided, try creating student"})
			return
		}
		if len(editBody.StudentPwd) != 8 && editBody.StudentPwd != "" {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "password length required of 8 characters"})
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
		if editBody.Section != "" && (len(editBody.Section) < 1 || len(editBody.Section) > 2) {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "accurate section not provided"})
			return
		}

		var defaultData EditBody
		err = db.QueryRow("SELECT * FROM students WHERE grNo=?", editBody.GR_No).Scan(&defaultData.GR_No, &defaultData.StudentPwd, &defaultData.UserRole, &defaultData.StudentName, &defaultData.Std, &defaultData.Section)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "no student found to be edited"})
			return
		}
		dbstr := "UPDATE students SET "
		var conditions []string
		if editBody.StudentPwd != defaultData.StudentPwd && editBody.StudentPwd != "" {
			conditions = append(conditions, ("sPwd = '" + editBody.StudentPwd + "'"))
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
		for i, v := range conditions {
			dbstr += v
			if i != len(conditions)-1 {
				dbstr += ","
			}
		}
		dbstr += (" WHERE grNo = " + strconv.Itoa(editBody.GR_No))

		if len(conditions) > 0 {
			_, err = db.Exec(dbstr)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while updating db"})
				return
			}
		} else {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "old values = new values not allowed"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "student updated successfully"})
		return
	}
}

func CreateSub(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	if role == "admin" {
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
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "error processing body"})
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
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error processing data"})
			return
		}
		if err == sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": fmt.Sprintf("first set limit of subjects allocated in standard %d", subInfo.LevelStd)})
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
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	if role == "admin" {
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
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "error while readingbody"})
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
		var amt2 int
		if err = db.QueryRow("SELECT COUNT(subId) FROM marks WHERE subId=?", editBody.SubId).Scan(&amt2); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
		if amt2 > 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "Marks are alloted to students associated to subject you want to edit. Cant edit, only delete is possible"})
			return
		}
		if editBody.SubName != "" && len(editBody.SubName) > 50 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid subject name, pls provide name upto 50 chars"})
			return
		}
		if editBody.LevelStd != 0 {
			if editBody.LevelStd < 0 || editBody.LevelStd > 12 {
				ctx.JSON(http.StatusBadRequest, gin.H{"error": "only standard from 1 to 12 are valid"})
				return
			}
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
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "subject not found to edit"})
			return
		}
		dbstr := "UPDATE subjects SET "
		var conditions []string
		if editBody.SubId != defaultData.SubId && editBody.SubId != 0 {
			conditions = append(conditions, ("subId = " + strconv.Itoa(editBody.SubId)))
		}
		if editBody.SubName != defaultData.SubName && editBody.SubName != "" {
			conditions = append(conditions, ("subName = '" + editBody.SubName + "'"))
		}
		if editBody.LevelStd != 0 && editBody.LevelStd != defaultData.LevelStd && editBody.LevelStd <= 12 && editBody.LevelStd > 0 {
			conditions = append(conditions, ("levelStd = " + strconv.Itoa(editBody.LevelStd)))
		}
		if editBody.Credits != defaultData.Credits {
			conditions = append(conditions, ("credits = " + strconv.Itoa(editBody.Credits)))
		}
		for i, v := range conditions {
			dbstr += v
			if i != len(conditions)-1 {
				dbstr += ","
			}
		}
		dbstr += ("WHERE subId = " + strconv.Itoa(editBody.SubId))

		if len(conditions) > 0 {
			_, err = db.Exec(dbstr)
			if err != nil {
				ctx.JSON(http.StatusInternalServerError, gin.H{"error": "error while updating db"})
				return
			}
		} else {
			ctx.JSON(http.StatusOK, gin.H{"output": "no changes"})
			return
		}
		ctx.JSON(http.StatusOK, gin.H{"output": "subject updated successfully"})
		return
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}
}

func EnterMarks(ctx *gin.Context) {

	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	if role == "admin" {
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
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "record already present please try updating it"})
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
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	if role == "admin" {
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
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
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
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject not exist whom you want to rdit marks"})
			return
		}
		var amount int
		err = db.QueryRow("SELECT COUNT(grNo) FROM marks WHERE grNo = ? AND subId = ?", editBody.GrNo, editBody.SubId).Scan(&amount)
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amount <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "record not present please try creating it"})
			return
		}
		var defaultData marks
		err = db.QueryRow("SELECT * FROM marks WHERE grNo=? AND subId=?", editBody.GrNo, editBody.SubId).Scan(&defaultData.GrNo, &defaultData.SubId, &defaultData.TheoryMarks, &defaultData.PracticalMarks, &tempgrade)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "such grno and subject id entry not found"})
			return
		}
		dbstr := "UPDATE marks SET "
		changeOccur := false
		var conditions []string
		if editBody.TheoryMarks != defaultData.TheoryMarks && editBody.TheoryMarks <= 80 && editBody.TheoryMarks >= 0 {
			conditions = append(conditions, ("theoryM = " + strconv.Itoa(editBody.TheoryMarks)))
			changeOccur = true
		}
		if editBody.PracticalMarks != defaultData.PracticalMarks && editBody.PracticalMarks <= 20 && editBody.PracticalMarks >= 0 {
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
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "no changes specified"})
			return
		}
	} else {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized user"})
		return
	}

}

func Performance(ctx *gin.Context) {
	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println(err)
		return
	}
	defer db.Close()
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorizes access"})
		return
	}
	var TeacherId struct {
		Tid string
	}
	TeacherId.Tid = ctx.Param("tid")
	fmt.Println("teacher id inocming", TeacherId.Tid)
	if TeacherId.Tid == "" {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "no id found"})
		return
	}
	if TeacherId.Tid != "" {
		if len(TeacherId.Tid) > 8 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid teacher's id"})
			return
		}
		var amt int
		if err = db.QueryRow(fmt.Sprintf("SELECT COUNT(tId) FROM teachers WHERE tId = '%s'", TeacherId.Tid)).Scan(&amt); err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		if amt <= 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "no such teacher found with entered teacher id"})
			return
		}
		var teachFlag int
		if err = db.QueryRow("SELECT subId FROM teachers WHERE tId=?", TeacherId.Tid).Scan(&teachFlag); teachFlag == 0 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "teacher id you provided doesnt take any subject, so no performance can be evaluated"})
			return
		} else if err == sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "teacher id you provided doesnt take any subject, so no performance can be evaluated"})
			return
		}
		if err != nil && err != sql.ErrNoRows {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}
	} else {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "please provide teacher's id"})
		return
	}
	res := db.QueryRow(fmt.Sprintf("SELECT subId,stdAllocated FROM teachers WHERE tId = '%s'", TeacherId.Tid))
	var std int
	var stda int
	if err = res.Scan(&std, &stda); err != nil && err != sql.ErrNoRows {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "something went wrong"})
		return
	} else if std == 0 || stda == 0 {
		ctx.JSON(http.StatusBadRequest, gin.H{"error": "subject/standard is not allocated to teacher whose performance you requested. thus no performance can be fetched"})
		return
	} else if err == sql.ErrNoRows {
		ctx.JSON(http.StatusInternalServerError, gin.H{"error": "subject/standard is not allocated to teacher whose performance you requested. thus no performance can be fetched"})
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
			res3, err := db.Query(fmt.Sprintf("SELECT t.tId, t.tName, t.stdAllocated, s.subName, SUM(m.theoryM) AS totalTheory, SUM(m.practicalM) AS totalPractical FROM marks m LEFT JOIN teachers t ON m.subId = t.subId INNER JOIN subjects s ON t.subId = s.subId WHERE t.tId = '%s' GROUP BY t.tId, t.tName, t.stdAllocated, s.subName", temp))
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
	// fmt.Println(result)
	if len(result) == 0 {
		ctx.JSON(http.StatusOK, gin.H{"output": "no results found"})
		return
	}
	ctx.JSON(http.StatusOK, gin.H{"output": result})
}

func DelStud(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
		fmt.Println("no token found")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	}
	if role == "admin" {
		var stdGrno struct {
			GRno int `json:"grNo" binding:"required"`
		}
		if err := ctx.ShouldBindJSON(&stdGrno); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "unable to read body"})
			return
		}
		if stdGrno.GRno <= 0 || stdGrno.GRno > 99999999 {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "invalid student id entered for deletion"})
			return
		}
		db, err := sql.Open("mysql", dsn)
		if err != nil {
			ctx.JSON(http.StatusInternalServerError, gin.H{"error": "CANNOT CONNECT TO DB"})
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
	if !exist || role != "admin" {
		fmt.Println("no token found")
		ctx.JSON(http.StatusUnauthorized, gin.H{"error": "unauthirused access"})
		return
	}
	if role == "admin" {
		var subid struct {
			SubId int `json:"subId" binding:"required"`
		}
		if err := ctx.ShouldBindJSON(&subid); err != nil {
			ctx.JSON(http.StatusBadRequest, gin.H{"error": "unable to read body"})
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
		defer db.Close()
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

func SelfData(ctx *gin.Context) {
	role, exist := ctx.Get("userrole")
	if !exist || role != "admin" {
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
		}
		err = db.QueryRow("SELECT admin_id,admin_name,admin_pwd FROM admins WHERE admin_id=?", temp).Scan(&otpt.Id, &otpt.Name, &otpt.Password)
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
