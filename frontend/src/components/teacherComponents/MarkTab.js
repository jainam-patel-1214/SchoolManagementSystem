import styled from "styled-components"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../studentComponents/SchoolRes"
import { toast, ToastContainer } from "react-toastify"
import { StyledButton } from "../../styled-components/styledButton"
import { useRef, useState } from "react"
import { ButtonContainer, InputContainer } from "./StudentsTab"
import { FaCircleUser, FaOrcid } from "react-icons/fa6"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { PiExamFill, PiExamLight } from "react-icons/pi"
import { ErrorToast, Toaster } from "../../utils/Toaster"
import { FetchApi } from "../../utils/FetchApi"
import { GrNoOrSubIdValidation, PracticalMarksValidation, TheoryMarksValidation } from "../../utils/Validations"

export const TeacherInputTabContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: .5rem;
    align-items: center;
`


const fetchData = async (e, grNo, setter, setDisplayData, apiUrl, methodtype, dataObj, todo, errorComp, cleanup) => {
    e.preventDefault()
    const errarr = ["invalid gr no", "invalid sub id", "theory marks range shall be from 0 to 80", "practical marks range shall be from 0 to 20"]
    let flagarr = [false, false, false, false]
    if ( !TheoryMarksValidation(dataObj?.theoryMarks)) flagarr[2] = true
    if ( !(PracticalMarksValidation(dataObj?.practicalMarks))) flagarr[3] = true
    if (!GrNoOrSubIdValidation(grNo)) flagarr[0] = true
    if ( !GrNoOrSubIdValidation(dataObj?.subId)) flagarr[1] = true

    let errstr = ""
    let anyErr = false
    flagarr.forEach((v, i) => {
        if (v) {
            errstr += (errarr[i] + ", ")
            anyErr = true
        }
    })

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
        switch (todo) {
            case "addMark":
                bodyObj['grNo'] = grNo
                res = await FetchApi(apiUrl, methodtype, bodyObj)
                break;
            case "editMark":
                bodyObj['grNo'] = grNo
                res = await FetchApi(apiUrl, methodtype, bodyObj)
                break;
            default:
                break;
        }

        Toaster(res,toast)
        if (res.output) {
            setDisplayData(res.output)
            return
        }
    } catch (err) {
        ErrorToast(err,toast)
    } finally {
        cleanup.forEach(e => { e(null) })
        e.target.reset();
    }
};

export const MarkEditTab = (props) => {
    const errorComp = useRef(null)

    const [grNo, setGrNo] = useState(null)
    const [subid, setsubid] = useState(null)
    const [theory, setTheory] = useState(null)
    const [practical, setPractical] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e, type) => {
        switch (type) {
            case "sub":
                setsubid(Number(e.target.value))
                break;
            case "theory":
                setTheory(Number(e.target.value))
                break;
            case "grno":
                setGrNo(Number(e.target.value))
                break;
            case "practical":
                setPractical(Number(e.target.value))
                break;
            default:
                break;
        }
    }

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, grNo, setGrNo, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/updateMarks`, 'PUT', { "subId": subid, "theoryMarks": theory, "practicalMarks": practical }, "editMark", errorComp, [setPractical, setTheory, setsubid, setGrNo]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={grNo || ""} required name="grno" placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "grno") }} />
                                    <FloatingLabel>Provide Gr NO for student:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={subid || ""} required name="sid" placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "sub") }} />
                                    <FloatingLabel>Provide subject id:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further details which you wish to edit:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <PiExamFill style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={theory || ""} name="tm" placeholder=" " onChange={(e) => { changeHandler(e, "theory") }} />
                                    <FloatingLabel>Provide updated theoritical marks:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <PiExamLight style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={practical || ""} name="pm" placeholder=" " onChange={(e) => { changeHandler(e, "practical") }} />
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

export const MarkAddTab = (props) => {
    const errorComp = useRef(null)

    const [grNo, setGrNo] = useState(null)
    const [subid, setsubid] = useState(null)
    const [theory, setTheory] = useState(null)
    const [practical, setPractical] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e, type) => {
        switch (type) {
            case "sub":
                setsubid(Number(e.target.value))
                break;
            case "theory":
                setTheory(Number(e.target.value))
                break;
            case "grno":
                setGrNo(Number(e.target.value))
                break;
            case "practical":
                setPractical(Number(e.target.value))
                break;
            default:
                break;
        }
    }
    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, grNo, setGrNo, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/enterMarks`, 'POST', { "subId": subid, "theoryMarks": theory, "practicalMarks": practical }, "addMark", errorComp, [setPractical, setTheory, setsubid, setGrNo]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={grNo || ""} required name="grno" placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "grno") }} />
                                    <FloatingLabel>Provide Gr NO for student:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={subid || ""} required name="sid" placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "sub") }} />
                                    <FloatingLabel>Provide subject id here:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further details for the student's score:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <PiExamFill style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={theory || ""} name="tm" required placeholder=" " onChange={(e) => { changeHandler(e, "theory") }} />
                                    <FloatingLabel>Provide theoritical marks:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <PiExamLight style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={practical || ""} name="pm" required placeholder=" " onChange={(e) => { changeHandler(e, "practical") }} />
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
