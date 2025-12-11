import { FaRegUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa";
import { Fragment, useState, useEffect, useRef } from "react";
import styled, { keyframes } from "styled-components";
import { SignInBtn } from "../styled-components/LoginSigninButton";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ErrorToast, SuccessToast, Toaster } from "../utils/Toaster";
import { CookieSetter } from "../utils/setCookie";
import { FetchApi } from "../utils/FetchApi";
const SelectInRegister = styled.select`
  border: 1px solid #b9b9b9;
  padding: 5px;
`;
const SignInForm = styled.div`
        display: flex;
        flex-direction: column;
        align-items: center;
        width: fit-content;
        padding: 3rem;
        background-color: whitesmoke;
        border: none;
        border-radius: 5px;
        h3{
            cursor: pointer;
            margin: 0;
            margin-top: 10px;
            transition: 0.3s;

            &:hover{
                border-bottom: 1px solid black;
                border-top: none;
                border-left: none;
                border-right: none;
                color: blue;
            }
        }
        p{
            margin: 0;
        }
        
    `
const typing = keyframes`
    from {
        text-align: center;
        width: 0;
    }
    to {
        width: 100%;
    }
    `;
const SignUpAndLoginForm = styled.form`
        display: flex;
        flex-direction: column;

        h2{
            text-align: center;
            animation: ${typing} 2s steps(19) forwards;
            overflow: hidden;
            white-space: nowrap;
        }
        label{
            color: rgb(67, 66, 66);
            margin-top: 1rem;
        }
        input{
            background-color: transparent;
            border-bottom: 1px solid black;
            border-top: none;
            border-left: none;
            border-right: none;
            margin-bottom: 1rem;
            font-size: large;
            &::placeholder{
                color: rgb(144, 144, 144);
                font-size: small;
            }
            &:focus{
                border-bottom: 1px solid black;
                border-top: none;
                border-left: none;
                border-right: none;
                outline: none;
            }
        }
    `
export const LoginRegisterForm = () => {
    const navigate = useNavigate()
    const buttonRef = useRef(null)
    const initState = {
        userId: 0,
        password: "",
        userName: "",
        userRole: ""
    }
    const [validInp, setValidInp] = useState(false)
    const [data, setData] = useState(initState)
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
        setData(initState)
        setShowRegister(true);
    };
    const loginChangeHandler = () => {
        setShowLogin(true);
        setData(initState)
        setShowRegister(false);
    };

    const handleSignUp = async (e) => {
        e.preventDefault();
        if (!validInp) {
            ErrorToast("invalid values in below fields", toast)
            return
        }
        if (data?.userRole === "") {
            alert("pick a role for yourself to register with");
            return;
        }
        if (data?.userName === "" || data?.password === "") {
            alert("enter userid and password properly");
            return;
        }
        try {
            const body = { yourName: data?.userName, password: data?.password, roleReq: data?.userRole }
            const res = await FetchApi("http://localhost:8090/register", "POST", body)
            Toaster(res, toast)
        } catch (error) {
            ErrorToast(error, toast)
            console.log(error);
        } finally {
            setData(initState);
            e.target.reset()
            setValidInp(false)
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (!validInp) {
            ErrorToast("invalid values in below fields", toast)
            return
        }
        if (data?.userId === "" || data?.password === "") {
            alert("enter userid and password properly");
            return;
        }
        try {
            const body = { userId: Number(data?.userId), password: data?.password, userRole: data?.userRole }
            const res = await FetchApi("http://localhost:8090/login", "POST", body)
            console.log("login body",res);
            
            Toaster(res, toast)
            CookieSetter(data?.userId, res.username, res.output, res.role)
            if (res.role === "student") {
                navigate("/app/student")
            }
            if (res.role === "teacher") {
                navigate("/app/teacher")
            }
            if (res.role === "admin") {
                navigate("/app/admin")
            }
        } catch (error) {
            console.log(error);
            ErrorToast(error,toast)
        } finally {
            setData(initState);
            setValidInp(false)
        }

    };
    useEffect(() => {
        const isLoginValid = showLogin &&
            data.password !== null &&
            data.userId !== null &&
            data.userRole !== null &&
            data.userId > 0 &&
            data.userId <= 99999999 &&
            data.password.length === 8 &&
            data.userRole.toString() !== "";

        const isRegisterValid = showRegister &&
            data.password !== null &&
            data.userName !== null &&
            data.userRole !== null &&
            data.userName.length >= 2 &&
            data.password.length === 8 &&
            data.userRole.toString() !== "";

        setValidInp((showLogin && isLoginValid) || (showRegister && isRegisterValid));
    }, [data])


    return (
        <SignInForm>
            <ToastContainer />
            {showLogin ?
                <Fragment>
                    <SignUpAndLoginForm onSubmit={(e) => { handleLogin(e) }}>
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
                        <SelectInRegister
                            onChange={(e) => {
                                dataChangeHandler("userRole", e.target.value)
                            }}
                            value={data?.userRole || ""}
                            name="userRole"
                        >
                            <option value="">Provide your role</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </SelectInRegister>
                        <SignInBtn ref={buttonRef} type="submit">Login</SignInBtn>
                    </SignUpAndLoginForm>
                    <p>Or sign up using</p>
                    <h3 onClick={registerChangeHandler}>Sign Up</h3>
                </Fragment>
                :
                <></>
            }
            {showRegister ? (
                <Fragment>
                    <SignUpAndLoginForm onSubmit={(e) => { handleSignUp(e) }}>
                        <h2>Welcome to Scholar</h2>
                        <label htmlFor="userName">
                            <FaRegUser /> Your name
                        </label>
                        <input
                            type="text"
                            name="userName"
                            id="username"
                            value={data?.userName || ""}
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
                            value={data?.password || ""}
                            placeholder="provide a password"
                            onChange={(e) => {
                                dataChangeHandler("password", e.target.value)
                            }}
                        />
                        <SelectInRegister
                            onChange={(e) => {
                                dataChangeHandler("userRole", e.target.value)
                            }}
                            value={data?.userRole || ""}
                            name="userRole"
                        >
                            <option value="">Select a role you wish to register</option>
                            <option value="student">Student</option>
                            <option value="teacher">Teacher</option>
                            <option value="admin">Admin</option>
                        </SelectInRegister>
                        <SignInBtn ref={buttonRef} type="submit">SignUp</SignInBtn>
                    </SignUpAndLoginForm>
                    <p>Or log in using</p>
                    <h3 onClick={loginChangeHandler}>Log In</h3>
                </Fragment>
            ) : (
                <></>
            )}
        </SignInForm>
    );
};
