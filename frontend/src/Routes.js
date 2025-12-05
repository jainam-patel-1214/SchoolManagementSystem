import { CreateTeacherComponent } from './components/adminComponents/admin_manageteacherComponents/CreateTeacher'
import { TeacherDelComponent } from './components/adminComponents/admin_manageteacherComponents/DelTeacher'
import { DisplayTeacherPerformanceComponent } from './components/adminComponents/admin_manageteacherComponents/DisplayTeacher'
import { TeacherEditComponent } from './components/adminComponents/admin_manageteacherComponents/EditTeacher'
import { AdminHome, AdminPendingReqTab } from './components/adminComponents/Home'
import { SubjectLimit } from './components/adminComponents/SubLim'
import { Navbar } from './components/Navbar'
import { SignIn } from './components/Signin'
import { StudentHomePage } from './components/studentComponents/Home'
import { SchoolResult } from './components/studentComponents/SchoolRes'
import { TeacherHome } from './components/teacherComponents/Home'
import { AddMarkTab } from './components/teacherComponents/markComponents/AddMarks'
import { EditMarkTab } from './components/teacherComponents/markComponents/EditMarks'
import { ReviewTab } from './components/teacherComponents/Review'
import { StudentAddComponent } from './components/teacherComponents/studentComponents/AddStudent'
import { StudentDelComponent } from './components/teacherComponents/studentComponents/DeleteStudent'
import { StudentEditComponent } from './components/teacherComponents/studentComponents/EditStudent'
import { StudentDataComponent } from './components/teacherComponents/studentComponents/GetStudentData'
import { SubAddTabComp } from './components/teacherComponents/subjectComponents/AddSub'
import { SubDelTabComp } from './components/teacherComponents/subjectComponents/DelSub'
import { DisplaySubTabComp } from './components/teacherComponents/subjectComponents/DisplaySub'
import { SubEditTabComp } from './components/teacherComponents/subjectComponents/EditSub'
import './index.css'
import { Routes, Route } from 'react-router-dom'

function ProjectRouter() {


  return (
    <Routes>
      <Route index element={<SignIn />}></Route>
      <Route path="signIn" element={<SignIn />}></Route>
      <Route path="app/student" element={<Navbar/>}>
        <Route index element={<StudentHomePage />}/>
        <Route path='schoolResult' element={<SchoolResult roleOfPerson="student"/>}></Route>
        <Route path='searchSubject' element={<DisplaySubTabComp roleOfPerson="student" />}></Route>
      </Route>
      <Route path='app/teacher' element={<Navbar roleOfPerson="teacher" />}>
        <Route index element={<TeacherHome roleOfPerson="teacher" />}/>
        <Route path='reviews' element={<ReviewTab roleOfPerson="teacher"/>}></Route>

        <Route path='displayStudent' element={<StudentDataComponent roleOfPerson="teacher"/>}></Route>
        <Route path='addStudent' element={<StudentAddComponent roleOfPerson="teacher"/>}></Route>
        <Route path='editStudent' element={<StudentEditComponent roleOfPerson="teacher"/>}></Route>
        <Route path='deleteStudent' element={<StudentDelComponent roleOfPerson="teacher"/>}></Route>

        <Route path='displaySubject' element={<DisplaySubTabComp roleOfPerson="teacher"/>}></Route>
        <Route path='addSubject' element={<SubAddTabComp roleOfPerson="teacher"/>}></Route>
        <Route path='editSubject' element={<SubEditTabComp roleOfPerson="teacher"/>}></Route>
        <Route path='deleteSubject' element={<SubDelTabComp roleOfPerson="teacher"/>}></Route>

        <Route path='enterMarks' element={<AddMarkTab roleOfPerson="teacher"/>}></Route>
        <Route path='editMarks' element={<EditMarkTab roleOfPerson="teacher"/>}></Route>
      </Route>
      <Route path='app/admin' element={<Navbar roleOfPerson="admin" />}>
        <Route index element={<AdminHome roleOfPerson="admin" />}/>
        <Route path='reviews' element={<ReviewTab roleOfPerson="admin"/>}></Route>

        <Route path='displayStudent' element={<StudentDataComponent roleOfPerson="admin"/>}></Route>
        <Route path='addStudent' element={<StudentAddComponent roleOfPerson="admin"/>}></Route>
        <Route path='editStudent' element={<StudentEditComponent roleOfPerson="admin"/>}></Route>
        <Route path='deleteStudent' element={<StudentDelComponent roleOfPerson="admin"/>}></Route>

        <Route path='displaySubject' element={<DisplaySubTabComp roleOfPerson="admin"/>}></Route>
        <Route path='addSubject' element={<SubAddTabComp roleOfPerson="admin"/>}></Route>
        <Route path='editSubject' element={<SubEditTabComp roleOfPerson="admin"/>}></Route>
        <Route path='deleteSubject' element={<SubDelTabComp roleOfPerson="admin"/>}></Route>

        <Route path='setSubjectLimit' element={<SubjectLimit roleOfPerson="admin"/>}></Route>

        <Route path='enterMarks' element={<AddMarkTab roleOfPerson="admin"/>}></Route>
        <Route path='editMarks' element={<EditMarkTab roleOfPerson="admin"/>}></Route>

        <Route path='teacherPerformance' element={<DisplayTeacherPerformanceComponent roleOfPerson="admin"/>}></Route>
        <Route path='addTeacher' element={<CreateTeacherComponent roleOfPerson="admin"/>}></Route>
        <Route path='editTeacher' element={<TeacherEditComponent roleOfPerson="admin"/>}></Route>
        <Route path='delTeacher' element={<TeacherDelComponent roleOfPerson="admin"/>}></Route>

        <Route path='pendingApplications' element={<AdminPendingReqTab roleOfPerson="admin"/>}></Route>
      </Route>
    </Routes>
  )
}

export default ProjectRouter
