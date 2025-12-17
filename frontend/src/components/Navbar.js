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
            <StyledNavbarTabs
              onClick={() => handleNavigation("displayStudent")}
            >
              Students
              <FaAngleUp style={{ verticalAlign: "middle" }} />
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
            <StyledNavbarTabs
              onClick={() => handleNavigation("displaySubject")}
            >
              Subjects <FaAngleUp style={{ verticalAlign: "middle" }} />
            </StyledNavbarTabs>
          ) : (
            <></>
          )}
          {role === "teacher" || role === "admin" ? (
            <StyledNavbarTabs onClick={() => handleNavigation("enterMarks")}>
              Exams <FaAngleUp style={{ verticalAlign: "middle" }} />
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
