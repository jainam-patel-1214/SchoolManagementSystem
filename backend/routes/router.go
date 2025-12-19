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

			teach.GET("/studentreport", teacher.Report)
			teach.GET("/displayStud", admin.ListStudents)
			teach.POST("/createStud", teacher.AddStudent)
			teach.PUT("/updateStud", teacher.EditStud)
			teach.DELETE("/delStudent", teacher.DelStud)

			teach.PUT("/updateSub", teacher.EditSub)
			teach.POST("/enterMarks", teacher.EnterMarks)

			teach.POST("/createSub", teacher.CreateSub)
			teach.PUT("/updateMarks", teacher.EditMarks)
			teach.GET("/displaySub", student.DisplaySubject)
			teach.DELETE("/delSubject", teacher.DelSub)

			teach.POST("/addReview", teacher.AddReviews)
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

			admn.GET("/studentreport", admin.Report)
			admn.POST("/createStud", admin.AddStudent)
			admn.GET("/displayStud", admin.ListStudents)
			admn.PUT("/updateStud", admin.EditStud)
			admn.DELETE("/delStudent", admin.DelStud)

			admn.GET("/displaySub", student.DisplaySubject)
			admn.POST("/createSub", admin.CreateSub)
			admn.PUT("/updateSub", admin.EditSub)
			admn.DELETE("/delSubject", admin.DelSub)

			admn.POST("/enterMarks", admin.EnterMarks)
			admn.PUT("/updateMarks", admin.EditMarks)

			admn.POST("/setSubLimit", admin.SetSubLimit)
		}
	}
	return r
}
