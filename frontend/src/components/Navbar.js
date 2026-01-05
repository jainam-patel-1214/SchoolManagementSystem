import { useEffect, useState } from "react";
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
import { ToastContainer } from "react-toastify";
import { FaAngleUp } from "react-icons/fa6";
import { SuccessToast } from "../utils/toasterCode";

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
    SuccessToast("Good Bye! Have a nice day");
    const msg = await delCookie("userid", "username", "token", "role");
    setTimeout(() => {
      if (msg.output !== null || msg.output !== undefined) {
        SuccessToast(msg.output);
        navigate("/login");
      }
    }, 1000);
  };
  const handleNavigation = (loc) => {
    navigate(loc);
  };
  const navigationMenuContent = {
    student: {
      staticTabs: [
        {
          name: "School result",
          location: "schoolResult",
          action: handleNavigation,
        },
      ],
      dropDownTabs: [
        {
          name: "Account",
          location: "/app/student",
          action: handleNavigation,
        },
      ],
    },
    teacher: {
      staticTabs: [
        {
          name: "Students",
          location: "displayStudent",
          action: handleNavigation,
        },
        {
          name: "Subjects",
          location: "displaySubject",
          action: handleNavigation,
        },
        {
          name: "Marks",
          location: "enterMarks",
          action: handleNavigation,
        },
      ],
      dropDownTabs: [
        {
          name: "Account",
          location: "/app/teacher",
          action: handleNavigation,
        },
        {
          name: "Add review",
          location: "reviews",
          action: handleNavigation,
        },
      ],
    },
    admin: {
      staticTabs: [
        {
          name: "Students",
          location: "displayStudent",
          action: handleNavigation,
        },
        {
          name: "Teachers",
          location: "displayTeacher",
          action: handleNavigation,
        },
        {
          name: "Subjects",
          location: "displaySubject",
          action: handleNavigation,
        },
        {
          name: "Marks",
          location: "enterMarks",
          action: handleNavigation,
        },
      ],
      dropDownTabs: [
        {
          name: "Account",
          location: "/app/admin",
          action: handleNavigation,
        },
        {
          name: "Pending Req",
          location: "pendingApplications",
          action: handleNavigation,
        },
      ],
    },
    common: {
      staticTabs: [
        {
          name: "SignOut",
          id: "signOutButton",
          action: signOutHandler,
        },
      ],
      dropDownTabs: [],
    },
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
          {uName !== "" &&
            navigationMenuContent.common.staticTabs?.map(
              ({ name, id, action }, i) => (
                <StyledNavbarTabs key={i} id={id} onClick={action}>
                  {name}
                </StyledNavbarTabs>
              )
            )}
          {navigationMenuContent[role]?.staticTabs?.map(
            ({ name, location, action }, i) => {
              return (
                <StyledNavbarTabs key={i} onClick={() => action(location)}>
                  {name}
                  <FaAngleUp style={{ verticalAlign: "middle" }} />
                </StyledNavbarTabs>
              );
            }
          )}
          <StyledNavbarTabs>
            Profile <FaAngleUp style={{ verticalAlign: "middle" }} />
            <StyledNavbarSubTabs>
              {navigationMenuContent[role]?.dropDownTabs?.map(
                ({ name, location, action }, i) => {
                  return (
                    <NavbarTabs key={i} onClick={() => action(location)}>
                      {name}
                    </NavbarTabs>
                  );
                }
              )}
            </StyledNavbarSubTabs>
          </StyledNavbarTabs>
        </div>
      </StyledNavbar>
      <Outlet />
    </div>
  );
};
