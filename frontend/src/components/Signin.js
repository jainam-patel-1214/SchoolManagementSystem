import bgimg from "../assets/bg.jpg"
import { LoginRegisterForm } from "./LoginRegisterform"
// import '../styles/signin.css'
import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import getCookie from "../utils/getCookie"
import { ToastContainer, toast } from "react-toastify"
import { SuccessToast } from "../utils/Toaster"
import styled from "styled-components"
const SignInSections = styled.div`
        width: 50%;
        height: 100%;
        display: ${(props)=>{return props.variant==='loginform'?"flex":""}};
        justify-content: ${(props)=>{return props.variant==='loginform'?"center":""}};
        align-items: ${(props)=>{return props.variant==='loginform'?"center":""}};

        background: ${(props)=>{return props.variant==="loginform"?`linear-gradient(to top right,cyan,rgb(0, 153, 255),rgba(148, 0, 148, 0.76),rgba(255, 78, 217, 0.869))`:"white"}};

        img{
            height: 100%;
            width: 100%;
            object-fit: cover;
        }
    `
    const SignInPage = styled.div`
        display: flex;
        flex-direction: row;
        height: 100vh;
        width: 100vw;
    `
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
        <SignInPage>
            <ToastContainer />
            <SignInSections>
                <img src={bgimg} alt="background" />
            </SignInSections>
            <SignInSections variant={"loginform"}>
                < LoginRegisterForm />
            </SignInSections>
        </SignInPage>
    )
}