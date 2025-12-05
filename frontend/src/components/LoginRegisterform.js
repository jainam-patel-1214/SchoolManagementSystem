import { FaRegUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa";
import { Fragment, useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { SignInBtn } from "../styled-components/LoginSigninButton";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ErrorToast, SuccessToast } from "../utils/Toaster";
import { CookieSetter } from "../utils/setCookie";
import { NullStateObjGenerator, ObjValueChangeHandler, ResetState } from "../utils/StateSetter";
const SelectInRegister = styled.select`
  border: 1px solid #b9b9b9;
  padding: 5px;
`;

export const LoginRegisterForm = () => {
    const navigate = useNavigate()
    const [validInp, setValidInp] = useState(false)
    const [loginRegisterData, setLoginRegisterData] = useState(NullStateObjGenerator(["userId","password","userName","userRole"]))
    const [showLogin, setShowLogin] = useState(true);
    const [showRegister, setShowRegister] = useState(false);

    const registerChangeHandler = () => {
        setShowLogin(false);
        setShowRegister(true);
    };
    const loginChangeHandler = () => {
        setShowLogin(true);
        setShowRegister(false);
    };
    

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (loginRegisterData?.userRole === "") {
            alert("pick a role for yourself to register with");
            return;
        }
        if (loginRegisterData?.userName === "" || loginRegisterData?.password === "") {
            alert("enter userid and password properly");
            return;
        }
        try {
            await axios
                .post(
                    "http://localhost:8090/register",
                    { yourName: loginRegisterData?.userName, password: loginRegisterData?.password, roleReq: loginRegisterData?.userRole },
                    { headers: { "Content-Type": "application/json" } }
                )
                .then((res) => {
                    SuccessToast(res.data.output + ". Wait till any admin accepts it.", toast)
                })
                .catch((err) => {
                    ErrorToast(err.response.data.error || err, toast)
                });
        } catch (error) {
            console.log(error);
        } finally {
            ResetState(loginRegisterData,setLoginRegisterData)
            e.target.reset()
            setValidInp(false)
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (loginRegisterData.userId === "" || loginRegisterData.password === "") {
            alert("enter userid and password properly");
            return;
        }
        try {
            await axios
                .post(
                    "http://localhost:8090/login",
                    { userId: loginRegisterData.userId, password: loginRegisterData.password },
                    { headers: { "Content-Type": "application/json" } }
                )
                .then((res) => {
                    SuccessToast('Login Successful!', toast)
                    CookieSetter(loginRegisterData.userId, res.data.username, res.data.output, res.data.role)
                    if (res.data.role === "student") {
                        navigate("/app/student")
                    }
                    if (res.data.role === "teacher") {
                        navigate("/app/teacher")
                    }
                    if (res.data.role === "admin") {
                        navigate("/app/admin")
                    }
                })
                .catch((err) => {
                    ErrorToast(err.response.data.error || err, toast)
                });
        } catch (error) {
            console.log(error);
        } finally {
            e.target.reset()
            ResetState(loginRegisterData,setLoginRegisterData)
            setValidInp(false)
        }

    };

    useEffect(() => {
        if (validInp) {
            document.querySelectorAll(".applyNoAfter").forEach(e => {
                e.classList.add("noAfter")
                e.removeAttribute("disabled")
            })
        } else {
            document.querySelectorAll(".applyNoAfter").forEach(e => {
                e.classList.remove("noAfter")
                e.setAttribute("disabled", true)
            })
        }
    }, [validInp])
    useEffect(() => {
        console.log("hi");
        
        if ((showLogin && loginRegisterData.userId?.length > 0 && loginRegisterData?.userId?.length <= 8 && loginRegisterData?.password?.length === 8) || (showRegister && loginRegisterData?.userName?.length >= 2 && loginRegisterData?.password?.length === 8 && loginRegisterData?.userRole?.toString() !== "")) {
            setValidInp(true)
        } else setValidInp(false)
    }, [loginRegisterData])


    return (
        <div id="signInForm">
            <ToastContainer />
            {showLogin ?
                <Fragment>
                    <form id="loginform" onSubmit={handleLogin}>
                        <h2>Welcome to Scholar</h2>
                        <label htmlFor="userId">
                            <FaRegUser /> User Id
                        </label>
                        <input
                            type="text"
                            name="userId"
                            id="userid"
                            placeholder="user id here"
                            onChange={(e) => {
                                ObjValueChangeHandler(e,setLoginRegisterData,'string')
                            }}
                        />
                        <label htmlFor="password">
                            <FaKey /> Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="password here"
                            onChange={(e) => {
                                ObjValueChangeHandler(e,setLoginRegisterData,'string')
                            }}
                        />
                        <SignInBtn className="applyNoAfter" type="submit">Login</SignInBtn>
                    </form>
                    <p>Or sign up using</p>
                    <h3 onClick={registerChangeHandler}>Sign Up</h3>
                </Fragment>
                :
                <></>
            }
            {showRegister ? (
                <Fragment>
                    <form id="signupform" onSubmit={handleSignUp}>
                        <h2>Welcome to Scholar</h2>
                        <label htmlFor="userName">
                            <FaRegUser /> Your name
                        </label>
                        <input
                            type="text"
                            name="userName"
                            id="userid"
                            placeholder="provide your name"
                            onChange={(e) => {
                                ObjValueChangeHandler(e,setLoginRegisterData)
                            }}
                        />
                        <label htmlFor="password">
                            <FaKey /> Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="provide a password"
                            onChange={(e) => {
                                ObjValueChangeHandler(e,setLoginRegisterData)
                            }}
                        />
                        <SelectInRegister
                            onChange={(e) => {
                                ObjValueChangeHandler(e,setLoginRegisterData)
                            }}
                            name="userRole"
                        >
                            <option value="">Select a role you wish to register</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </SelectInRegister>
                        <SignInBtn className="applyNoAfter" type="submit">SignUp</SignInBtn>
                    </form>
                    <p>Or log in using</p>
                    <h3 onClick={loginChangeHandler}>Log In</h3>
                </Fragment>
            ) : (
                <></>
            )}
        </div>
    );
};
