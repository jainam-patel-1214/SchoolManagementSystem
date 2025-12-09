import { FaRegUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa";
import { Fragment, useState, useEffect, useRef } from "react";
import axios from "axios";
import styled from "styled-components";
import { SignInBtn } from "../styled-components/LoginSigninButton";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ErrorToast, SuccessToast } from "../utils/Toaster";
import { CookieSetter } from "../utils/setCookie";
const SelectInRegister = styled.select`
  border: 1px solid #b9b9b9;
  padding: 5px;
`;

export const LoginRegisterForm = () => {
    const navigate = useNavigate()
    const buttonRef = useRef(null)
    const [validInp, setValidInp] = useState(false)
    const [data, setData] = useState({
        userId: null,
        password: null,
        userName: null,
        userRole: null
    })
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const [showLogin, setShowLogin] = useState(true);
    const [showRegister, setShowRegister] = useState(false);

    const registerChangeHandler = () => {
        setShowLogin(false);
        emptyStates()
        setShowRegister(true);
    };
    const loginChangeHandler = () => {
        setShowLogin(true);
        emptyStates()
        setShowRegister(false);
    };

    const emptyState = ()=>{
        const nullifiedUserData = Object.keys(data).reduce((acc, key) => {
                acc[key] = null;
                return acc;
            }, {});
            setData(nullifiedUserData);
    }
    const handleSignUp = async (e) => {
        e.preventDefault();
        if (data?.userRole === "") {
            alert("pick a role for yourself to register with");
            return;
        }
        if (data?.userName === "" || data?.password === "") {
            alert("enter userid and password properly");
            return;
        }
        try {
            await axios
                .post(
                    "http://localhost:8090/register",
                    { yourName: data?.userName, password: data?.password, roleReq: data?.userRole },
                    { headers: { "Content-Type": "application/json" } }
                )
                .then((res) => {
                    SuccessToast(res.data.output + ". Wait till any admin accepts it.", toast)
                })
                .catch((err) => {
                    ErrorToast(err.response.data.error || err, toast)
                });
        } catch (error) {
            ErrorToast(error)
            console.log(error);
        } finally {
            emptyStates()
            e.target.reset()
            setValidInp(false)
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (data?.userId === "" || data?.password === "") {
            alert("enter userid and password properly");
            return;
        }
        try {
            await axios
                .post(
                    "http://localhost:8090/login",
                    { userId: data?.userId, password: data?.password },
                    { headers: { "Content-Type": "application/json" } }
                )
                .then((res) => {
                    SuccessToast('Login Successful!', toast)
                    CookieSetter(data?.userId, res.data.username, res.data.output, res.data.role)
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
            emptyStates()
            setData(nullifiedUserData);
            setValidInp(false)
        }

    };

    useEffect(() => {
        if (!buttonRef.current) return;
        if (!validInp) {
            buttonRef.current.disabled = true;
            buttonRef.current.classList.remove("noAfter");
        } else {
            buttonRef.current.disabled = false;
            buttonRef.current.classList.add("noAfter");
        }

    }, [validInp])
    useEffect(() => {
        const isLoginValid = showLogin &&
            data?.password !== null &&
            data?.userId !== null &&
            data?.userId > 0 &&
            data?.userId <= 99999999 &&
            data?.password?.length === 8;

        const isRegisterValid = showRegister &&
            data?.password !== null &&
            data?.userName !== null &&
            data?.userRole !== null &&
            data?.userName?.length >= 2 &&
            data?.password?.length === 8 &&
            data?.userRole?.toString() !== "";

        setValidInp((showLogin&&isLoginValid) || (showRegister&&isRegisterValid));
    }, [data])


    return (
        <div id="signInForm">
            <ToastContainer />
            {showLogin ?
                <Fragment>
                    <form id="loginform" onSubmit={(e) => { handleLogin(e) }}>
                        <h2>Welcome to Scholar</h2>
                        <label htmlFor="userId">
                            <FaRegUser /> User Id
                        </label>
                        <input
                            type="number"
                            name="userId"
                            id="userid"
                            placeholder="user id here"
                            value={data?.userId || ""}
                            onChange={(e) => {
                                dataChangeHandler("userId", Number(e.target.value))
                            }}
                        />
                        <label htmlFor="password">
                            <FaKey /> Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={data?.password || ""}
                            placeholder="password here"
                            onChange={(e) => {
                                dataChangeHandler("password", e.target.value)
                            }}
                        />
                        <SignInBtn ref={buttonRef} type="submit">Login</SignInBtn>
                    </form>
                    <p>Or sign up using</p>
                    <h3 onClick={registerChangeHandler}>Sign Up</h3>
                </Fragment>
                :
                <></>
            }
            {showRegister ? (
                <Fragment>
                    <form id="signupform" onSubmit={(e) => { handleSignUp(e) }}>
                        <h2>Welcome to Scholar</h2>
                        <label htmlFor="userName">
                            <FaRegUser /> Your name
                        </label>
                        <input
                            type="text"
                            name="userName"
                            id="username"
                            value={data?.userName}
                            placeholder="provide your name"
                            onChange={(e) => {
                                dataChangeHandler("userName", e.target.value)
                            }}
                        />
                        <label htmlFor="password">
                            <FaKey /> Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={data?.password}
                            placeholder="provide a password"
                            onChange={(e) => {
                                dataChangeHandler("password", e.target.value)
                            }}
                        />
                        <SelectInRegister
                            onChange={(e) => {
                                dataChangeHandler("userRole", e.target.value)
                            }}
                            value={data?.userRole}
                            name="userRole"
                        >
                            <option value="">Select a role you wish to register</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </SelectInRegister>
                        <SignInBtn ref={buttonRef} type="submit">SignUp</SignInBtn>
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
