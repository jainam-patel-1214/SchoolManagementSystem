import { useRef, useState } from "react"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes"
import { toast, ToastContainer } from "react-toastify"
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../StudentsTab"
import { FaCircleUser, FaOrcid } from "react-icons/fa6"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp"
import { PiExamFill, PiExamLight } from "react-icons/pi"
import { StyledButton } from "../../../styled-components/styledButton"
import { GrNoOrSubIdValidation, PracticalMarksValidation, TheoryMarksValidation } from "../../../utils/validations"
import { ErrorToast, Toaster } from "../../../utils/Toaster"
import { fetchApi } from "../../../utils/fetchApi"
import { roleExtractor } from "../../../utils/roleExtractor"

export const AddMarkTab = () => {
    const userrole = roleExtractor(window.location.pathname)
    const errorComp = useRef(null)
    const initState = {
        grNo: 0,
        subId: 0,
        theory: null,
        practical: null
    }
    const [data, setData] = useState(initState)
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const [displayData, setDisplayData] = useState(null)
    const submitHandler = async (e, apiUrl, dataObj) => {
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
                console.log(key, value);
                if (value !== null && value !== undefined) {
                    bodyObj[key] = value
                }
            }
            res = await fetchApi(apiUrl, "POST", bodyObj)
            Toaster(res, toast)
            if (res.output) {
                setDisplayData(res.output)
                return
            }
        } catch (err) {
            ErrorToast(err, toast)
        } finally {
            setData(initState);
            e.target.reset();
        }
    };

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { submitHandler(e, `http://localhost:8090/${userrole}/enterMarks`, { "grNo": data.grNo, "subId": data.subId, "theoryMarks": data.theory, "practicalMarks": data.practical }) }}>
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
                                    <FloatingLabel>Provide subject id here:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further details for the student's score:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <PiExamFill style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.theory || ""} name="tm" required placeholder=" " onChange={(e) => { dataChangeHandler("theory", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide theoritical marks:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <PiExamLight style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.practical || ""} name="pm" required placeholder=" " onChange={(e) => { dataChangeHandler("practical", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide practical marks:</FloatingLabel>
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