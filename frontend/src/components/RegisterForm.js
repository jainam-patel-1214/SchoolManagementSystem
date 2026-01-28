import { ToastContainer } from "react-toastify";
import {
  SelectInRegister,
  SignInForm,
  SignUpAndLoginForm,
} from "../styled-components/LoginSignUpComponents";
import { FaKey, FaRegUser } from "react-icons/fa";
import { SignInBtn } from "../styled-components/LoginSigninButton";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { ErrorToast, Toaster } from "../utils/toasterCode";
import { fetchApi } from "../utils/fetchApiCode";
import { StringValidator } from "../utils/validations";
import { rolesMap } from "./LoginForm";

export const RegisterForm = () => {
  const navigate = useNavigate();
  const initState = {
    password: "",
    userName: "",
    userRole: "",
  };
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (data.userName === "" || !StringValidator(data.userName)) {
      ErrorToast("please enter your name");
      return;
    }
    if (data.userRole === "") {
      ErrorToast("pick a role for yourself to register with");
      return;
    }
    if (data.password.length < 8 || data.password.length > 16) {
      ErrorToast("please enter an 8-16 digit password");
      return;
    }
    try {
      const body = {
        yourName: data.userName,
        password: data.password,
        roleReq: data.userRole,
      };
      const res = await fetchApi("/register", "POST", body);
      Toaster(res);
    } catch (error) {
      ErrorToast(error);
      console.log(error);
    } finally {
      setData(initState);
      e.target.reset();
    }
  };

  return (
    <SignInForm>
      <ToastContainer />
      <SignUpAndLoginForm
        onSubmit={(e) => {
          handleSignUp(e);
        }}
      >
        <h2>Welcome to Scholar</h2>
        <label htmlFor="userName">
          <FaRegUser /> Your name
        </label>
        <input
          type="text"
          required
          name="userName"
          id="username"
          value={data.userName || ""}
          placeholder="provide your name"
          onChange={(e) => {
            dataChangeHandler("userName", e.target.value);
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
          placeholder="provide a password"
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
        <SignInBtn type="submit">SignUp</SignInBtn>
      </SignUpAndLoginForm>
      <p>Or log in using</p>
      <h3 onClick={() => navigate("/login")}>Log In</h3>
    </SignInForm>
  );
};
