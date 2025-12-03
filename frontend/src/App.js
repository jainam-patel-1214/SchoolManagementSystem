import { AdminHome, AdminPendingReqTab } from './components/adminComponents/Home'
import { SubjectLImit } from './components/adminComponents/SubLim'
import { TeacherAddTab, TeacherDelTab, TeacherEditTab, TeacherPerformance } from './components/adminComponents/TeachersTab'
import { Navbar } from './components/Navbar'
import { SignIn } from './components/Signin'
import { StudentHomePage } from './components/studentComponents/Home'
import { SchoolResult } from './components/studentComponents/SchoolRes'
import { TeacherHome } from './components/teacherComponents/Home'
import { MarkAddTab, MarkEditTab } from './components/teacherComponents/MarkTab'
import { ReviewTab } from './components/teacherComponents/Review'
import { StudentAddTab, StudentDelTab, StudentEditTab, StudentTab } from './components/teacherComponents/StudentsTab'
import { SubAddTab, SubDelTab, SubEditTab, SubTab } from './components/teacherComponents/SubjectTab'
import './index.css'
import { Routes, Route } from 'react-router-dom'

function App() {


  return (
    <Routes>
      <Route index element={<SignIn />}></Route>
      <Route path="signIn" element={<SignIn />}></Route>
      <Route path="app/student" element={<Navbar/>}>
        <Route index element={<StudentHomePage />}/>
        <Route path='schoolResult' element={<SchoolResult roleOfPerson="student"/>}></Route>
        <Route path='searchSubject' element={<SubTab roleOfPerson="student" />}></Route>
      </Route>
      <Route path='app/teacher' element={<Navbar roleOfPerson="teacher" />}>
        <Route index element={<TeacherHome roleOfPerson="teacher" />}/>
        <Route path='reviews' element={<ReviewTab roleOfPerson="teacher"/>}></Route>
        <Route path='displayStudent' element={<StudentTab roleOfPerson="teacher"/>}></Route>
        <Route path='addStudent' element={<StudentAddTab roleOfPerson="teacher"/>}></Route>
        <Route path='editStudent' element={<StudentEditTab roleOfPerson="teacher"/>}></Route>
        <Route path='deleteStudent' element={<StudentDelTab roleOfPerson="teacher"/>}></Route>
        <Route path='displaySubject' element={<SubTab roleOfPerson="teacher"/>}></Route>
        <Route path='addSubject' element={<SubAddTab roleOfPerson="teacher"/>}></Route>
        <Route path='editSubject' element={<SubEditTab roleOfPerson="teacher"/>}></Route>
        <Route path='deleteSubject' element={<SubDelTab roleOfPerson="teacher"/>}></Route>
        <Route path='enterMarks' element={<MarkAddTab roleOfPerson="teacher"/>}></Route>
        <Route path='editMarks' element={<MarkEditTab roleOfPerson="teacher"/>}></Route>
      </Route>
      <Route path='app/admin' element={<Navbar roleOfPerson="admin" />}>
        <Route index element={<AdminHome roleOfPerson="admin" />}/>
        <Route path='reviews' element={<ReviewTab roleOfPerson="admin"/>}></Route>
        <Route path='displayStudent' element={<StudentTab roleOfPerson="admin"/>}></Route>
        <Route path='addStudent' element={<StudentAddTab roleOfPerson="admin"/>}></Route>
        <Route path='editStudent' element={<StudentEditTab roleOfPerson="admin"/>}></Route>
        <Route path='deleteStudent' element={<StudentDelTab roleOfPerson="admin"/>}></Route>
        <Route path='displaySubject' element={<SubTab roleOfPerson="admin"/>}></Route>
        <Route path='addSubject' element={<SubAddTab roleOfPerson="admin"/>}></Route>
        <Route path='editSubject' element={<SubEditTab roleOfPerson="admin"/>}></Route>
        <Route path='deleteSubject' element={<SubDelTab roleOfPerson="admin"/>}></Route>
        <Route path='setSubjectLimit' element={<SubjectLImit roleOfPerson="admin"/>}></Route>
        <Route path='enterMarks' element={<MarkAddTab roleOfPerson="admin"/>}></Route>
        <Route path='editMarks' element={<MarkEditTab roleOfPerson="admin"/>}></Route>
        <Route path='teacherPerformance' element={<TeacherPerformance roleOfPerson="admin"/>}></Route>
        <Route path='addTeacher' element={<TeacherAddTab roleOfPerson="admin"/>}></Route>
        <Route path='editTeacher' element={<TeacherEditTab roleOfPerson="admin"/>}></Route>
        <Route path='delTeacher' element={<TeacherDelTab roleOfPerson="admin"/>}></Route>
        <Route path='pendingApplications' element={<AdminPendingReqTab roleOfPerson="admin"/>}></Route>
      </Route>
    </Routes>
  )
}

export default App
