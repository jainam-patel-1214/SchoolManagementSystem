import { useRef, useState } from "react"
import { GradeValidation, GrNoOrSubIdValidation } from "../../../utils/validations"
import { fetchApi } from "../../../utils/fetchApi"
import { ErrorToast, Toaster } from "../../../utils/toaster"
import { toast, ToastContainer } from "react-toastify"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes"
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../StudentsTab"
import { FaOrcid } from "react-icons/fa6"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp"
import { RiBookShelfLine } from "react-icons/ri"
import { IoIosRibbon } from "react-icons/io"
import { LuBookA } from "react-icons/lu"
import { StyledButton } from "../../../styled-components/StyledButton"
import { roleExtractor } from "../../../utils/roleExtractor"

export const SubAddTabComp = () => {
    const errorComp = useRef(null)
    const userrole = roleExtractor(window.location.pathname)
    const initState = {
        subid: 0,
        subname: "",
        subcredit: null,
        substd: 0
    }
    const [data, setData] = useState(initState)
    const [displayData, setDisplayData] = useState(null)
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }

    const submitHandler = async (e, apiUrl, dataObj) => {
        e.preventDefault()
        const errobj = { "grade": { "condition": false, "message": "invalid grade. Allowed range is 1 - 12" }, "subid": { "condition": false, "message": "invalid sub id" } }
        if (!GradeValidation(data?.substd)) errobj.grade.condition = true
        if (!GrNoOrSubIdValidation(data?.subid)) errobj.subid.condition = true
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
                    <SearchForm onSubmit={(e) => { submitHandler(e, `http://localhost:8090/${userrole}/createSub`, { "subId": data.subid, "subName": data.subname, "credits": data.subcredit, "levelStd": data.substd }, "addSub", errorComp) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.subid || ''} name="subid" required placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("subid", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide SubId for new subject:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further mendatory details below:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "35%" }}>
                                <LuBookA style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="subname" value={data.subname || ''} placeholder=" " maxLength={55} onChange={(e) => { dataChangeHandler("subname", (e.target.value)) }} />
                                    <FloatingLabel>Provide subject name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "35%" }}>
                                <IoIosRibbon style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subcredit" value={data.subcredit || ''} placeholder=" " onChange={(e) => { dataChangeHandler("subcredit", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide subject credits:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "35%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="substd" value={data.substd || ''} placeholder=" " onChange={(e) => { dataChangeHandler("substd", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide subject's grade:</FloatingLabel>
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