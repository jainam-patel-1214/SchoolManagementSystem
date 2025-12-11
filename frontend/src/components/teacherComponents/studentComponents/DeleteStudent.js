import { useRef, useState } from "react"
import { GrNoOrSubIdValidation } from "../../../utils/validations"
import { fetchApi } from "../../../utils/fetchApi"
import { ErrorToast, Toaster } from "../../../utils/Toaster"
import { toast, ToastContainer } from "react-toastify"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes"
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../StudentsTab"
import { FaCircleUser } from "react-icons/fa6"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp"
import { StyledButton } from "../../../styled-components/styledButton"
import { roleExtractor } from "../../../utils/roleExtractor"

export const StudentDelComponent = () => {
    const errorComp = useRef(null)
    const userrole = roleExtractor(window.location.pathname)
    const [grNo, setGrNo] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e) => {
        e.preventDefault()
        setGrNo(Number(e.target.value))
    }

    const sumbitHandler = async (e, apiUrl) => {
        e.preventDefault()
        const errobj = { "grno": { "condition": false, "message": "invalid gr no" }}
        if (!GrNoOrSubIdValidation(grNo)) errobj.grno.condition = true
        if (errobj.grno.condition) {
            errorComp.current.innerText = errobj.grno.message
            errorComp.current.style.display = "block"
            return
        } else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = "none"
        }
        try {
            let res;
            res = await fetchApi(apiUrl,"DELETE",{ "grNo": grNo })
            Toaster(res,toast)
            if (res.output) {
                setDisplayData(res.output)
                return
            }
        } catch (err) {
            ErrorToast(err,toast)
        } finally {
            setGrNo(null)
            e.target.reset();
        }
    };

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { sumbitHandler(e, `http://localhost:8090/${userrole}/delStudent`) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={grNo || ''} name="grNo" required placeholder=" " onChange={(e) => { changeHandler(e) }} />
                                    <FloatingLabel>Enter Gr No of student you wish to delete:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton  type="submit">Submit</StyledButton>
                        </ButtonContainer>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
            {displayData !== undefined && displayData !== null ? <SearchOutputSection>
                {typeof (displayData) === "string" && (displayData !== undefined || displayData !== null) ? <div>{displayData}</div> : <></>}
            </SearchOutputSection> : <></>}
        </div>
    )
}