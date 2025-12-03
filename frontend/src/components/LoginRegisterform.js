import { FaRegUser } from "react-icons/fa";
import { FaKey } from "react-icons/fa";
import { Fragment, useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
import { SignInBtn } from "../styled-components/LoginSigninButton";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { ErrorToast, SuccessToast } from "../utils/Toaster";
const SelectInRegister = styled.select`
  border: 1px solid #b9b9b9;
  padding: 5px;
`;

export const LoginRegisterForm = () => {
    const navigate = useNavigate()
    const [userId, setUserID] = useState("");
    const [validInp, setValidInp] = useState(false)
    const [pwd, setPwd] = useState("");
    const [name, setname] = useState("");
    const [role, setRole] = useState("");
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
    const valueChangeHandler = (e, state) => {
        e.preventDefault();
        if (state === "pwd") {
            setPwd(e.target.value);
        }
        if (state === "id") {
            setUserID(e.target.value);
        }
        if (state === "role") {
            setRole(e.target.value);
        }
        if (state === "name") {
            setname(e.target.value);
        }
    };

    const handleSignUp = async(e) => {
        e.preventDefault();
        console.log(name, pwd, role);
        if (role === "") {
            alert("pick a role for yourself to register with");
            return;
        }
        if (name === "" || pwd === "") {
            alert("enter userid and password properly");
            return;
        }
        try {
            await axios
            .post(
                "http://localhost:8090/register",
                { yourName: name, password: pwd, roleReq: role },
                { headers: { "Content-Type": "application/json" } }
            )
            .then((res) => {
                SuccessToast(res.data.output + ". Wait till any admin accepts it.",toast)
            })
            .catch((err) => {
                ErrorToast(err.response.data.error||err,toast)
            });
        } catch (error) {
            console.log(error);
        }finally{
            setPwd("")
            setRole("")
            setname("")
            e.target.reset()
            setValidInp(false)}
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        console.log(userId, pwd);
        if (userId === "" || pwd === "") {
            alert("enter userid and password properly");
            return;
        }
        try {
            await axios
            .post(
                "http://localhost:8090/login",
                { userId: userId, password: pwd },
                { headers: { "Content-Type": "application/json" } }
            )
            .then((res) => {
                SuccessToast('Login Successful!',toast)
                const now = new Date();
                let timenow = now.getTime();
                timenow += 86340000;
                now.setTime(timenow);
                document.cookie = "userid=" + userId + "; expires=" + now.toUTCString()
                document.cookie = "username=" + res.data.username + "; expires=" + now.toUTCString();
                document.cookie = "token=" + res.data.output + "; expires=" + now.toUTCString();
                document.cookie = "role=" + res.data.role + "; expires=" + now.toUTCString()
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
                ErrorToast(err.response.data.error||err,toast)
            });
        } catch (error) {
            console.log(error);
        }finally{
            e.target.reset()
            setPwd("");
            setUserID("");
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
        if ((showLogin && userId.length > 0 && userId.length <= 8 && pwd.length === 8) || (showRegister && name.length >= 2 && pwd.length === 8 && role != "")) {
            setValidInp(true)
        } else setValidInp(false)
    }, [name, userId, pwd, role])


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
                                valueChangeHandler(e, "id");
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
                                valueChangeHandler(e, "pwd");
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
                                valueChangeHandler(e, "name");
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
                                valueChangeHandler(e, "pwd");
                            }}
                        />
                        <SelectInRegister
                            onChange={(e) => {
                                valueChangeHandler(e, "role");
                            }}
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
