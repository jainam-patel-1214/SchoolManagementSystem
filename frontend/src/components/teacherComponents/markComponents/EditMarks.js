import { useRef, useState } from "react"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes"
import { toast, ToastContainer } from "react-toastify"
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../StudentsTab"
import { FaCircleUser, FaOrcid } from "react-icons/fa6"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp"
import { PiExamFill, PiExamLight } from "react-icons/pi"
import { StyledButton } from "../../../styled-components/styledButton"
import { GrNoOrSubIdValidation, PracticalMarksValidation, TheoryMarksValidation } from "../../../utils/Validations"
import { FetchApi } from "../../../utils/FetchApi"
import { ErrorToast, Toaster } from "../../../utils/Toaster"
import { roleExtractor } from "../../../utils/RoleExtractor"

export const EditMarkTab = (props) => {
    const userrole = roleExtractor(window.location.pathname)
    const errorComp = useRef(null)
    const [displayData, setDisplayData] = useState(null)
    const [data, setData] = useState({
        grNo: null,
        subId: null,
        theory: null,
        practical: null
    })
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const sumbitHandler = async (e, apiUrl, dataObj) => {
        e.preventDefault()
        const errobj = { "grno": { "condition": false, "message": "invalid gr no" }, "subid": { "condition": false, "message": "invalid sub id" }, "theory": { "condition": false, "message": "theory marks range shall be from 0 to 80" }, "practical": { "condition": false, "message": "practical marks range shall be from 0 to 20" } }
        if (!TheoryMarksValidation(dataObj?.theoryMarks)) errobj.theory.condition = true
        if (!(PracticalMarksValidation(dataObj?.practicalMarks))) errobj.practical.condition = true
        if (!GrNoOrSubIdValidation(dataObj?.grNo)) errobj.grno.condition = true
        if (!GrNoOrSubIdValidation(dataObj?.subId)) errobj.subid.condition = true
        let errstr = ""
        let anyErr = false
        for (const val of Object.values(errobj)) {
            if (val?.condition) {
                errstr += `\n${val?.message}`;
                anyErr = true
            }
        }
        if (anyErr) {
            errorComp.current.innerText = errstr
            errorComp.current.style.display = "block"
            return
        } else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = "none"
        }
        try {
            let res;
            let bodyObj = {}
            for (const [key, value] of Object.entries(dataObj)) {
                if (value !== null && value !== undefined) {
                    bodyObj[key] = value
                }
            }
            res = await FetchApi(apiUrl, "PUT", bodyObj)
            Toaster(res, toast)
            if (res.output) {
                setDisplayData(res.output)
                return
            }
        } catch (err) {
            ErrorToast(err, toast)
        } finally {
            const nullifiedUserData = Object.keys(data).reduce((acc, key) => {
                acc[key] = null;
                return acc;
            }, {});
            setData(nullifiedUserData);
            e.target.reset();
        }
    };

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { sumbitHandler(e, `http://localhost:8090/${userrole}/updateMarks`, { "grNo": data.grNo, "subId": data.subId, "theoryMarks": data.theory, "practicalMarks": data.practical }) }}>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.grNo || ""} required name="grno" placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("grNo", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide Gr NO for student:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.subId || ""} required name="sid" placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("subId", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide subject id:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further details which you wish to edit:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <PiExamFill style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.theory || ""} name="tm" placeholder=" " onChange={(e) => { dataChangeHandler("theory", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide updated theoritical marks:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <PiExamLight style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.practical || ""} name="pm" placeholder=" " onChange={(e) => { dataChangeHandler("practical", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide updated practical marks:</FloatingLabel>
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
            {displayData !== undefined && displayData !== null ? <SearchOutputSection>
                {typeof (displayData) === "string" ? <div style={{ padding: "10px" }}>{displayData}</div> : <></>}
            </SearchOutputSection> : <></>}
        </div>
    )
}