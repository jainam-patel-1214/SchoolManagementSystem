import { useRef, useState } from "react";
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes";
import { toast, ToastContainer } from "react-toastify";
import { TeacherInputTabContainer } from "../TeachersTab";
import { ButtonContainer, InputContainer } from "../../teacherComponents/StudentsTab";
import { FaIdCardAlt } from "react-icons/fa";
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp";
import { StyledButton } from "../../../styled-components/styledButton";
import { TeacherAdminIdValid } from "../../../utils/Validations";
import { FetchApi } from "../../../utils/FetchApi";
import { ErrorToast, Toaster } from "../../../utils/Toaster";
import { roleExtractor } from "../../../utils/RoleExtractor";

export const TeacherDelComponent = () => {
    const errorComp = useRef(null)
    const userrole = roleExtractor(window.location.pathname)
    const [tid, setTid] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    
    const submitHandler = async (e, apiUrl) => {
        e.preventDefault()
        const errobj = {"tid": { "condition": false, "message": "invalid teacher id" }}
        if (!TeacherAdminIdValid(tid)) errobj.tid.condition = true
        if (errobj.tid.condition) {
            errorComp.current.innerText = errobj.tid.message
            errorComp.current.style.display = "block"
            return
        } else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = "none"
        }
        try {
            let res;
            res = await FetchApi(apiUrl,"DELETE",{ "teacherId": tid })
            Toaster(res,toast)
            if (res.output) {
                setDisplayData(res.output)
                return
            }
        } catch (err) {
            ErrorToast(err,toast)
        } finally {
            setTid(null)
            e.target.reset();
        }
    };

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { submitHandler(e,`http://localhost:8090/${userrole}/delTeacher`) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaIdCardAlt style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="tid" value={tid || ''} required placeholder=" " onChange={(e) => { setTid(e.target.value) }} />
                                    <FloatingLabel>Provide id of teacher you wish to delete:</FloatingLabel>
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
            {displayData !== null && displayData !== undefined ? <SearchOutputSection>
                {(typeof displayData === 'string') ? <div style={{ padding: "10px" }}>{displayData}</div> :
                    <></>
                }
            </SearchOutputSection> : <></>}
        </div>
    )
}