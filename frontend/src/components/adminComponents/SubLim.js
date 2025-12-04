import { ToastContainer, toast } from "react-toastify"
import { useState, useRef } from "react"
import { StyledButton } from "../../styled-components/styledButton"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../studentComponents/SchoolRes"
import { ButtonContainer, InputContainer } from "../teacherComponents/StudentsTab"
import { TeacherInputTabContainer } from "./TeachersTab"
import { RiBookShelfLine } from "react-icons/ri"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { GiBookPile } from "react-icons/gi";
import { ErrorToast, Toaster } from "../../utils/Toaster"
import { FetchApi } from "../../utils/FetchApi"

export const SubjectLImit = (props) => {
    const errorComp = useRef(null)
    const [grade, setGrade] = useState(null)
    const [limit, setLimit] = useState(null)

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
            const res = await FetchApi(`http://localhost:8090/${props.roleOfPerson}/setSubLimit`, 'POST', temp)
            Toaster(res,toast)
        } catch (error) {
            ErrorToast(error,toast)
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
    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { setSubLim(e) }}>
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
                            <StyledButton type="submit">Submit</StyledButton>
                        </ButtonContainer>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
        </div>
    )
}