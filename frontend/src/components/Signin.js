import bgimg from "../assets/bg.jpg"
import { LoginRegisterForm } from "./LoginRegisterform"
import '../styles/signin.css'
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import getCookie from "../utils/getCookie"
import { ToastContainer, toast } from "react-toastify"
import { SuccessToast } from "../utils/Toaster"
export const SignIn = () => {
    const navigate = useNavigate()
    useEffect(() => {
        const x = getCookie("role")
        if (x!==undefined && x!== null&&x!=="") {
            SuccessToast(`You would be soon redirected to ${x}'s home page`,toast)
        }
        
        if (x === "student") {
            setTimeout(() => {
                navigate("/app/student")
            }, 2000);
        }
        if (x === "teacher") {
            setTimeout(() => {
                navigate("/app/teacher")
            }, 2000);
        }
        if (x === "admin") {
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