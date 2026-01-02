import { FaKey, FaRegUser } from "react-icons/fa";
import styled from "styled-components";
import { SignInBtn } from "../styled-components/LoginSigninButton";
import {
  SignInForm,
  SignUpAndLoginForm,
} from "../styled-components/LoginSignUpComponents";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ErrorToast, Toaster } from "../utils/toasterCode";
import { CookieSetter } from "../utils/setCookie";
import { fetchApi } from "../utils/fetchApiCode";
import { GrNoSubIdTeacherIdAdminIdValidation } from "../utils/validations";

const SelectInRegister = styled.select`
  border: 1px solid #b9b9b9;
  padding: 5px;
`;

export const rolesMap = [
  { value: "", label: "Provide your role" },
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
  { value: "admin", label: "Admin" },
];
export const LoginForm = () => {
  const navigate = useNavigate();
  const initState = {
    userId: 0,
    password: "",
    userRole: "",
  };
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (data.userRole === "") {
      ErrorToast("pick a role for yourself to register with");
      return;
    }
    if (
      data.userId.toString() === "" ||
      !GrNoSubIdTeacherIdAdminIdValidation(Number(data.userId))
    ) {
      console.log(
        data.userId.toString() !== "",
        GrNoSubIdTeacherIdAdminIdValidation(Number(data.userId))
      );

      ErrorToast("please enter your id");
      return;
    }
    if (data.password.length < 8 || data.password.length > 16) {
      ErrorToast("please enter an 8-16 digit password");
      return;
    }
    try {
      const body = {
        userId: Number(data.userId),
        password: data.password,
        userRole: data.userRole,
      };
      const res = await fetchApi("/login", "POST", body);
      console.log("login body", res);

      Toaster(res);
      CookieSetter(data.userId, res.username, res.output, res.role);
      if (res.role === "student") {
        navigate("/app/student");
      }
      if (res.role === "teacher") {
        navigate("/app/teacher");
      }
      if (res.role === "admin") {
        navigate("/app/admin");
      }
    } catch (error) {
      console.log(error);
      ErrorToast(error);
    } finally {
      setData(initState);
    }
  };
  return (
    <SignInForm>
      <ToastContainer />
      <SignUpAndLoginForm
        onSubmit={(e) => {
          handleLogin(e);
        }}
      >
        <h2>Welcome to Scholar</h2>
        <label htmlFor="userId">
          <FaRegUser /> User Id
        </label>
        <input
          type="number"
          name="userId"
          id="userid"
          required
          placeholder="user id here"
          value={data.userId || ""}
          onChange={(e) => {
            dataChangeHandler("userId", Number(e.target.value));
          }}
        />
        <label htmlFor="password">
          <FaKey /> Password
        </label>
        <input
          type="password"
          id="password"
          required
          name="password"
          value={data.password || ""}
          placeholder="password here"
          onChange={(e) => {
            dataChangeHandler("password", e.target.value);
          }}
        />
        <SelectInRegister
          onChange={(e) => {
            dataChangeHandler("userRole", e.target.value);
          }}
          value={data.userRole || ""}
          name="userRole"
        >
          {rolesMap.map(({ value, label }, i) => {
            return (
              <option value={value} key={i}>
                {label}
              </option>
            );
          })}
        </SelectInRegister>
        <SignInBtn type="submit">Login</SignInBtn>
      </SignUpAndLoginForm>
      <p>Or sign up using</p>
      <h3 onClick={() => navigate("/signup")}>Sign Up</h3>
    </SignInForm>
  );
};
