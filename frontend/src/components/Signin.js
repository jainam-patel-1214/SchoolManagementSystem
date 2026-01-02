import bgImg from "../assets/bg.jpg";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import getCookie from "../utils/getCookie";
import { ToastContainer } from "react-toastify";
import { SuccessToast } from "../utils/toasterCode";
import styled from "styled-components";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";
const SignInSections = styled.div`
  width: 50%;
  height: 100%;
  display: ${(props) => (props.variant === "loginform" ? "flex" : "")};
  justify-content: ${(props) =>
    props.variant === "loginform" ? "center" : ""};
  align-items: ${(props) => (props.variant === "loginform" ? "center" : "")};
  background: ${(props) =>
    props.variant === "loginform"
      ? `linear-gradient(to top right,cyan,rgb(0, 153, 255),rgba(148, 0, 148, 0.76),rgba(255, 78, 217, 0.869))`
      : "white"};

  img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
`;
const SignInPage = styled.div`
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
`;
export const SignIn = () => {
  const navigate = useNavigate();
  let isLogin = true;

  const currentUrl = window.location.href.split("/");
  if (currentUrl[currentUrl.length - 1] === "signup") {
    isLogin = false;
  } else isLogin = true;

  useEffect(() => {
    const tempRole = getCookie("role");
    if (tempRole !== undefined && tempRole !== null && tempRole !== "") {
      SuccessToast(`You would be soon redirected to ${tempRole}'s home page`);
    }

    if (tempRole === "student") {
      setTimeout(() => {
        navigate("/app/student");
      }, 2000);
    }
    if (tempRole === "teacher") {
      setTimeout(() => {
        navigate("/app/teacher");
      }, 2000);
    }
    if (tempRole === "admin") {
      setTimeout(() => {
        navigate("/app/admin");
      }, 2000);
    }
  }, []);

  return (
    <SignInPage>
      <ToastContainer />
      <SignInSections>
        <img src={bgImg} alt="background" />
      </SignInSections>
      <SignInSections variant={"loginform"}>
        {isLogin ? <LoginForm /> : <RegisterForm></RegisterForm>}
      </SignInSections>
    </SignInPage>
  );
};
