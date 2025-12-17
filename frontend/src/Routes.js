import { CreateTeacherComponent } from "./components/adminComponents/admin_manageteacherComponents/CreateTeacher";
import { TeacherDelComponent } from "./components/adminComponents/admin_manageteacherComponents/DeleteTeacher";
import { DisplayTeacherPerformanceComponent } from "./components/adminComponents/admin_manageteacherComponents/DisplayTeacher";
import { TeacherEditComponent } from "./components/adminComponents/admin_manageteacherComponents/EditTeacher";
import { AdminHome } from "./components/adminComponents/Home";
import { AdminPendingReqTab } from "./components/adminComponents/PendingRequestPage";
import { SubjectLimit } from "./components/adminComponents/SubjectLimit";
import { Navbar } from "./components/Navbar";
import { SignIn } from "./components/Signin";
import { StudentHomePage } from "./components/studentComponents/Home";
import { SchoolResult } from "./components/studentComponents/SchoolResult";
import { TeacherHome } from "./components/teacherComponents/Home";
import { AddMarkTab } from "./components/teacherComponents/markComponents/AddMarks";
import { EditMarkTab } from "./components/teacherComponents/markComponents/EditMarks";
import { ReviewTab } from "./components/teacherComponents/Review";
import { StudentAddComponent } from "./components/teacherComponents/studentComponents/AddStudent";
import { StudentDelComponent } from "./components/teacherComponents/studentComponents/DeleteStudent";
import { StudentEditComponent } from "./components/teacherComponents/studentComponents/EditStudent";
import { StudentDataComponent } from "./components/teacherComponents/studentComponents/GetStudentData";
import { SubAddTabComp } from "./components/teacherComponents/subjectComponents/AddSubject";
import { SubDelTabComp } from "./components/teacherComponents/subjectComponents/DeleteSubject";
import { DisplaySubTabComp } from "./components/teacherComponents/subjectComponents/DisplaySubject";
import { SubEditTabComp } from "./components/teacherComponents/subjectComponents/EditSubject";
import "./index.css";
import { Routes, Route } from "react-router-dom";

function ProjectRouter() {
  return (
    <Routes>
      <Route index element={<SignIn />}></Route>
      <Route path="signIn" element={<SignIn />}></Route>
      <Route path="app/student" element={<Navbar />}>
        <Route index element={<StudentHomePage />} />
        <Route path="schoolResult" element={<SchoolResult />}></Route>
        <Route path="searchSubject" element={<DisplaySubTabComp />}></Route>
      </Route>
      <Route path="app/teacher" element={<Navbar />}>
        <Route index element={<TeacherHome />} />
        <Route path="reviews" element={<ReviewTab />}></Route>

        <Route path="displayStudent" element={<StudentDataComponent />}></Route>
        <Route path="addStudent" element={<StudentAddComponent />}></Route>
        <Route path="editStudent" element={<StudentEditComponent />}>
          <Route index element={<StudentEditComponent />} />
          <Route path=":id" element={<StudentEditComponent />}></Route>
        </Route>
        {/* <Route path="deleteStudent" element={<StudentDelComponent />}></Route> */}

        <Route path="displaySubject" element={<DisplaySubTabComp />}></Route>
        <Route path="addSubject" element={<SubAddTabComp />}></Route>
        <Route path="editSubject" element={<SubEditTabComp />}>
          <Route index element={<SubEditTabComp />} />
          <Route path=":id" element={<SubEditTabComp />}></Route>
        </Route>
        <Route path="deleteSubject" element={<SubDelTabComp />}></Route>

        <Route path="enterMarks" element={<AddMarkTab />}></Route>
        <Route path="editMarks" element={<EditMarkTab />}></Route>
      </Route>
      <Route path="app/admin" element={<Navbar />}>
        <Route index element={<AdminHome />} />
        <Route path="reviews" element={<ReviewTab />}></Route>

        <Route path="displayStudent" element={<StudentDataComponent />}></Route>
        <Route path="addStudent" element={<StudentAddComponent />}></Route>
        <Route path="editStudent" element={<StudentEditComponent />}>
          <Route index element={<StudentEditComponent />} />
          <Route path=":id" element={<StudentEditComponent />}></Route>
        </Route>
        <Route path="displaySubject" element={<DisplaySubTabComp />}></Route>
        <Route path="addSubject" element={<SubAddTabComp />}></Route>
        <Route path="editSubject" element={<SubEditTabComp />}>
          <Route index element={<SubEditTabComp />} />
          <Route path=":id" element={<SubEditTabComp />}></Route>
        </Route>
        <Route path="setSubjectLimit" element={<SubjectLimit />}></Route>

        <Route path="enterMarks" element={<AddMarkTab />}></Route>
        <Route path="editMarks" element={<EditMarkTab />}></Route>

        <Route
          path="teacherPerformance"
          element={<DisplayTeacherPerformanceComponent />}
        ></Route>
        <Route path="addTeacher" element={<CreateTeacherComponent />}></Route>
        <Route path="editTeacher" element={<TeacherEditComponent />}></Route>
        <Route path="delTeacher" element={<TeacherDelComponent />}></Route>

        <Route
          path="pendingApplications"
          element={<AdminPendingReqTab />}
        ></Route>
      </Route>
    </Routes>
  );
}

export default ProjectRouter;
