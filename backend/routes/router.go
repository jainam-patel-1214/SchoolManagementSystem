package routes

import (
	"example.com/main/admin"
	"example.com/main/middleware"
	"example.com/main/student"
	"example.com/main/teacher"
	"github.com/gin-gonic/gin"
)

func InitializeRouter() *gin.Engine {
	r := gin.Default()
	r.Use(middleware.CORSMiddleware())
	// CreateSession is not actually a middleware but validate session is
	r.POST("/login", middleware.CreateSession)
	r.POST("/register", admin.CreatePendingReq)
	r.DELETE("/deleteCookieFromDB", middleware.DelCookie)
	{
		stud := r.Group("/student")
		stud.Use(middleware.ValidateSession())
		{
			stud.GET("/display", student.DisplayStudents)
			stud.GET("/displaySub", student.DisplaySubject)
			stud.GET("/report", student.Report)
			stud.GET("/data", student.SelfData)
		}
	}
	{
		teach := r.Group("/teacher")
		teach.Use(middleware.ValidateSession())
		{
			teach.GET("/data", teacher.SelfData)

			teach.GET("/displayPerformance", teacher.Performance)

			teach.GET("/studentreport/:grNo", teacher.Report)
			teach.GET("/isValidStudent/:grNo", teacher.IsValidStudent)
			teach.POST("/createStud", teacher.AddStudent)
			teach.PUT("/updateStud", teacher.EditStud)
			teach.DELETE("/delStudent", teacher.DelStud)

			teach.PUT("/updateSub", teacher.EditSub)
			teach.POST("/enterMarks", teacher.EnterMarks)

			teach.POST("/createSub", teacher.CreateSub)
			teach.GET("/studentData/:grNo", admin.DisplayParticularStudent)
			teach.GET("/subjectData/:subId", admin.DisplayParticularSubject)
			teach.GET("/isValidSubject/:subId", teacher.IsValidSubject)
			teach.GET("/isMarkRecordExist", teacher.DoMarkRecordExists)
			teach.PUT("/updateMarks", teacher.EditMarks)
			teach.GET("/displaySub", student.DisplaySubject)
			teach.DELETE("/delSubject", teacher.DelSub)

			teach.POST("/addReview", teacher.AddReviews)

			teach.GET("/allStudents", admin.DisplayAllStudents)
			teach.GET("/allSubjects", admin.DisplayAllSubjects)
			teach.GET("/selfStudents", teacher.DisplayStudentsUnderTeacher)
		}
	}
	{
		admn := r.Group("/admin")
		admn.Use(middleware.ValidateSession())
		{
			admn.GET("/pendingRequest", admin.ShowPendingReq)
			admn.POST("/acceptRequest", admin.AcceptPendingReq)
			admn.DELETE("/rejectRequest", admin.RejectRequest)
			admn.GET("/data", admin.SelfData)

			admn.DELETE("/delTeacher", admin.DeleteTeacher)
			admn.POST("/addTeacher", admin.AddTeacher)
			admn.PUT("/editTeacher", admin.EditTeacher)
			admn.GET("/displayTeacherPerformance/:tid", admin.Performance)

			admn.GET("/studentreport/:grNo", teacher.Report)
			admn.GET("/isValidStudent/:grNo", teacher.IsValidStudent)
			admn.POST("/createStud", admin.AddStudent)
			admn.PUT("/updateStud", admin.EditStud)
			admn.DELETE("/delStudent", admin.DelStud)

			admn.GET("/subjectData/:subId", admin.DisplayParticularSubject)
			admn.GET("/isValidSubject/:subId", teacher.IsValidSubject)
			admn.GET("/studentData/:grNo", admin.DisplayParticularStudent)
			admn.GET("/teacherData/:tid", admin.DisplayParticularTeacher)

			admn.GET("/displaySub", student.DisplaySubject)
			admn.GET("/isMarkRecordExist", teacher.DoMarkRecordExists)
			admn.POST("/createSub", admin.CreateSub)
			admn.PUT("/updateSub", admin.EditSub)
			admn.DELETE("/delSubject", admin.DelSub)

			admn.POST("/enterMarks", admin.EnterMarks)
			admn.PUT("/updateMarks", admin.EditMarks)

			admn.POST("/setSubLimit", admin.SetSubLimit)

			admn.GET("/allStudents", admin.DisplayAllStudents)
			admn.GET("/allSubjects", admin.DisplayAllSubjects)
			admn.GET("/allTeachers", admin.DisplayAllTeachers)
			admn.GET("/allAdmins", admin.DisplayAllAdmin)
			admn.GET("/isValidTeacher/:tid", admin.IsValidTeacher)
		}
	}
	return r
}
