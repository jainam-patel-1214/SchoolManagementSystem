import { ToastContainer, toast } from "react-toastify"
import { useState, useRef } from "react"
import { StyledButton } from "../../styled-components/styledButton"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../studentComponents/SchoolRes"
import { ButtonContainer, InputContainer } from "../teacherComponents/StudentsTab"
import { TeacherInputTabContainer } from "./TeachersTab"
import { RiBookShelfLine } from "react-icons/ri"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { GiBookPile } from "react-icons/gi";

export const SubjectLImit = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const [grade, setGrade] = useState(null)
    const [limit, setLimit] = useState(null)
    const [displayData, setDisplayData] = useState()

    const setSubLim = async (e) => {
        e.preventDefault()
        let errOccur = false
        if (grade != null && (grade < 1 || grade > 12)) errOccur = true
        else errOccur = false
        if (errOccur) {
            errorComp.current.style.display = 'block'
            errorComp.current.innerText = "invalid grade set. shall be between 1-12"
            return;
        }
        else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = 'none'
        }
        try {
            const temp = { "std": grade, "limit": limit }
            console.log(temp);
            await fetch(`http://localhost:8090/${props.roleOfPerson}/setSubLimit`, {
                method: "POST",
                credentials: "include",
                body: JSON.stringify(temp)
            }).then(async (res) => {
                const result = await res.json()
                if (result.output) {
                    successToast(result.output)
                }
                if (result.error) {
                    errorToast(result.error);
                }
            }).catch(e => {
                console.log(e.error);
                errorToast(e.error);
            })
        } catch (error) {
            console.log(error);
            errorToast(error.error);
        } finally {
            emptystates()
            e.target.reset()
        }
    }

    const changeHandler = (e, type) => {
        switch (type) {
            case "grade":
                setGrade(Number(e.target.value))
                break;
            case "limit":
                setLimit(Number(e.target.value))
                break;
            default:
                break;
        }
    }
    const emptystates = () => {
        setGrade(null)
        setLimit(null)
    }
    const successToast = (str) => {
        toast.success(str || "fetch successful", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }
    const errorToast = (str) => {
        toast.error(str || "Something went wrong", {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
        });
    }
    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm action="" onSubmit={(e) => { setSubLim(e) }}>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" required name="std" value={grade || ''} placeholder=" " onChange={(e) => { changeHandler(e, "grade") }} />
                                    <FloatingLabel>Provide grade of class you wish to set limit:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <GiBookPile style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" required value={limit || ''} name="lim" placeholder=" " onChange={(e) => { changeHandler(e, "limit") }} />
                                    <FloatingLabel>Provide limit of subjects for this standard:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton ref={buttonComp} type="submit">Submit</StyledButton>
                        </ButtonContainer>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
            {displayData !== undefined && displayData !== null ? <SearchOutputSection>
                {typeof (displayData) === "string" ? <span style={{ background: "#fa6c61", padding: "5px" }}>{displayData}</span> : <></>}
            </SearchOutputSection> : <></>}
        </div>
    )
}