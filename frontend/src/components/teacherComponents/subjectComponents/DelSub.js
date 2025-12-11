import { toast, ToastContainer } from "react-toastify";
import { fetchApi } from "../../../utils/fetchApi";
import { ErrorToast, Toaster } from "../../../utils/Toaster";
import { GrNoOrSubIdValidation } from "../../../utils/validations";
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes";
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../StudentsTab";
import { FaOrcid } from "react-icons/fa6";
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp";
import { StyledButton } from "../../../styled-components/styledButton";
import { useRef, useState } from "react";
import { roleExtractor } from "../../../utils/roleExtractor";

export const SubDelTabComp = () => {
    const errorComp = useRef(null)
    const [subid,setSubId] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const userrole = roleExtractor(window.location.pathname)
    const submitHandler = async (e, apiUrl) => {
        e.preventDefault()
        const errstr = "invalid sub id"
        let flag = false
        if (!GrNoOrSubIdValidation(subid)) flag = true
    
        if (flag) {
            errorComp.current.innerText = errstr
            errorComp.current.style.display = "block"
            return
        } else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = "none"
        }
        try {
            let res;
            res = await fetchApi(apiUrl,"DELETE",{ "subId": subid })
            Toaster(res,toast)
            if (res.output) {
                setDisplayData(res.output)
                return
            }
        } catch (err) {
            ErrorToast(err,toast)
        } finally {
            setSubId(null)
            e.target.reset();
        }
    };
    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { submitHandler(e,`http://localhost:8090/${userrole}/delSubject`) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subid" value={subid || ''} placeholder=" " onChange={(e) => { setSubId(Number(e.target.value)) }} />
                                    <FloatingLabel>Provide subId of subject you wish to delete:</FloatingLabel>
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
                {displayData!==undefined&&displayData!==null?<SearchOutputSection>
                    {(typeof displayData === 'string') ? <div style={{ padding: "10px" }}>{displayData}</div> :
                        <></>
                    }
                </SearchOutputSection>:<></>}
        </div>
    )
}