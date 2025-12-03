import bgimg from "../assets/bg.jpg"
import { LoginRegisterForm } from "./LoginRegisterform"
import '../styles/signin.css'
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import getCookie from "../utils/getCookie"
import { ToastContainer, toast } from "react-toastify"
export const SignIn = () => {
    const navigate = useNavigate()
    useEffect(() => {
        const x = getCookie("role")
        if (x === "student") {
            toast.success(`You would be soon redirected to ${x}'s home page`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setTimeout(() => {
                navigate("/app/student")
            }, 2000);
        }
        if (x === "teacher") {
            toast.success(`You would be soon redirected to ${x}'s home page`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setTimeout(() => {
                navigate("/app/teacher")
            }, 2000);
        }
        if (x === "admin") {
            toast.success(`You would be soon redirected to ${x}'s home page`, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            });
            setTimeout(() => {
                navigate("/app/admin")
            }, 2000);
        }
    }, [])

    return (
        <div id="signInPage">
            <ToastContainer />
            <div id="section-one">
                <img src={bgimg} alt="background" />
            </div>
            <div id="section-two">
                < LoginRegisterForm />
            </div>
        </div>
    )
}