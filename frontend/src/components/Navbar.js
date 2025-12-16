import { Fragment, useEffect, useState } from "react";
import {
  NavbarTabs,
  StyledNavbar,
  StyledNavbarSubTabs,
  StyledNavbarTabs,
} from "../styled-components/StyledNav";
import getCookie from "../utils/getCookie";
import { Outlet } from "react-router-dom";
import delCookie from "../utils/delCookie";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import { FaAngleUp } from "react-icons/fa6";

export const Navbar = () => {
  const navigate = useNavigate();
  const [uName, setuName] = useState("");
  const [role, setRole] = useState("");
  useEffect(() => {
    const name = getCookie("username");
    setuName(name);
    const role = getCookie("role");
    setRole(role);
  }, []);

  const signOutHandler = async (e) => {
    e.preventDefault();
    const msg = await delCookie("userid", "username", "token", "role");
    if (msg.output !== null || msg.output !== undefined) {
      toast(msg.output, {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });
      navigate("/signIn");
    }
  };
  const handleNavigation = (loc) => {
    navigate(loc);
  };

  return (
    <div>
      <ToastContainer />
      <StyledNavbar>
        <div>
          <p style={{ fontSize: "x-large" }}>
            Welcome <strong>{uName}</strong>
          </p>
        </div>
        <div>
          {uName !== "" ? (
            <StyledNavbarTabs onClick={(e) => signOutHandler(e)}>
              SignOut
            </StyledNavbarTabs>
          ) : (
            <></>
          )}
          {role === "student" ? (
            <StyledNavbarTabs onClick={() => handleNavigation("schoolResult")}>
              School result
            </StyledNavbarTabs>
          ) : (
            <></>
          )}

          {role === "teacher" || role === "admin" ? (
            <StyledNavbarTabs>
              Students <FaAngleUp style={{ verticalAlign: "middle" }} />
              <StyledNavbarSubTabs>
                <NavbarTabs onClick={() => handleNavigation("displayStudent")}>
                  Display Student
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("addStudent")}>
                  Add Student
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("editStudent")}>
                  Edit Student
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("deleteStudent")}>
                  Delete Student
                </NavbarTabs>
              </StyledNavbarSubTabs>
            </StyledNavbarTabs>
          ) : (
            <></>
          )}
          {role === "admin" ? (
            <StyledNavbarTabs>
              Teachers <FaAngleUp style={{ verticalAlign: "middle" }} />
              <StyledNavbarSubTabs>
                <NavbarTabs onClick={() => handleNavigation("addTeacher")}>
                  Add Teacher{" "}
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("editTeacher")}>
                  Edit Teacher{" "}
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("delTeacher")}>
                  Delete Teacher{" "}
                </NavbarTabs>

                <NavbarTabs
                  onClick={() => handleNavigation("teacherPerformance")}
                >
                  Performance
                </NavbarTabs>
              </StyledNavbarSubTabs>
            </StyledNavbarTabs>
          ) : (
            <></>
          )}
          {role === "teacher" || role === "admin" ? (
            <StyledNavbarTabs>
              Subjects <FaAngleUp style={{ verticalAlign: "middle" }} />
              <StyledNavbarSubTabs>
                <NavbarTabs onClick={() => handleNavigation("displaySubject")}>
                  List Subject
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("addSubject")}>
                  Add Subject
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("editSubject")}>
                  Edit Subject
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("deleteSubject")}>
                  Delete Subject
                </NavbarTabs>
                {role === "admin" ? (
                  <>
                    <NavbarTabs
                      onClick={() => handleNavigation("setSubjectLimit")}
                    >
                      Subject Limit
                    </NavbarTabs>
                  </>
                ) : (
                  <></>
                )}
              </StyledNavbarSubTabs>
            </StyledNavbarTabs>
          ) : (
            <></>
          )}
          {role === "teacher" || role === "admin" ? (
            <StyledNavbarTabs>
              Exams <FaAngleUp style={{ verticalAlign: "middle" }} />
              <StyledNavbarSubTabs>
                <NavbarTabs onClick={() => handleNavigation("enterMarks")}>
                  Add Marks
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("editMarks")}>
                  Edit Marks
                </NavbarTabs>
              </StyledNavbarSubTabs>
            </StyledNavbarTabs>
          ) : (
            <></>
          )}

          <StyledNavbarTabs>
            Profile <FaAngleUp style={{ verticalAlign: "middle" }} />
            {role === "student" ? (
              <StyledNavbarSubTabs>
                <NavbarTabs onClick={() => handleNavigation("/app/student")}>
                  Account
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("searchSubject")}>
                  Subjects
                </NavbarTabs>
              </StyledNavbarSubTabs>
            ) : (
              <></>
            )}
            {role === "teacher" ? (
              <StyledNavbarSubTabs>
                <NavbarTabs onClick={() => handleNavigation(`/app/teacher`)}>
                  Account
                </NavbarTabs>

                <NavbarTabs onClick={() => handleNavigation("reviews")}>
                  Add Review
                </NavbarTabs>
              </StyledNavbarSubTabs>
            ) : (
              <></>
            )}
            {role === "admin" ? (
              <StyledNavbarSubTabs>
                <NavbarTabs onClick={() => handleNavigation(`/app/admin`)}>
                  Account
                </NavbarTabs>

                <NavbarTabs
                  onClick={() => handleNavigation(`pendingApplications`)}
                >
                  Pending req
                </NavbarTabs>
              </StyledNavbarSubTabs>
            ) : (
              <></>
            )}
          </StyledNavbarTabs>
        </div>
      </StyledNavbar>
      <Outlet></Outlet>
    </div>
  );
};
