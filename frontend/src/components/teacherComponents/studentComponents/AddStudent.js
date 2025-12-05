import { useRef, useState } from "react"
import { GradeValidation, GrNoOrSubIdValidation, PasswordValidation, StringValidator } from "../../../utils/Validations"
import { FetchApi } from "../../../utils/FetchApi"
import { ErrorToast, Toaster } from "../../../utils/Toaster"
import { toast, ToastContainer } from "react-toastify"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp"
import { FaAddressCard, FaCircleUser, FaKey } from "react-icons/fa6"
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../StudentsTab"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes"
import { MdWindow } from "react-icons/md"
import { RiBookShelfLine } from "react-icons/ri"
import { StyledButton } from "../../../styled-components/styledButton"
import { roleExtractor } from "../../../utils/RoleExtractor"

export const StudentAddComponent = (props) => {
    const errorComp = useRef(null)
    const [data, setData] = useState({
        grNo: null,
        std: null,
        section: null,
        name: null,
        pwd: null
    })
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const [displayData, setDisplayData] = useState(null)

    const sumbitHandler = async (e, apiUrl, dataObj) => {
        e.preventDefault()
        const errobj = { "grno": { "condition": false, "message": "invalid gr no" }, "password": { "condition": false, "message": "passwords are needed to be 8 digits" }, "std": { "condition": false, "message": "standard shall have range of 1 - 12" }, "name": { "condition": false, "message": "invalid name" }, "section": { "condition": false, "message": "invalid section" } }
        if (!PasswordValidation(data?.pwd)) errobj.password.condition = true
        if (!GrNoOrSubIdValidation(data?.grNo)) errobj.grno.condition = true
        if (!GradeValidation(data?.std)) errobj.std.condition = true
        if (!StringValidator(data?.name)) errobj.name.condition = true
        if (!StringValidator(data?.section)) errobj.section.condition = true
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
            res = await FetchApi(apiUrl, "POST", bodyObj)
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
    const userrole = roleExtractor(window.location.pathname)
    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { sumbitHandler(e, `http://localhost:8090/${userrole}/createStud`, { "grNo": data?.grNo, "userRole": "student", "studName": data?.name, "studPwd": data?.pwd, "section": data?.section, "std": data?.std }) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.grNo || ''} required name="grno" placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("grNo", Number(e.target.value)) }} />
                                    <FloatingLabel>Enter Gr No for new student :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further details for the student below:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaKey style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="password" value={data.pwd || ''} required name="password" placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("pwd", (e.target.value)) }} />
                                    <FloatingLabel>Enter Password for new student :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaAddressCard style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="sname" value={data.name || ''} required placeholder=" " onChange={(e) => { dataChangeHandler("name", (e.target.value)) }} />
                                    <FloatingLabel>Enter name for new student :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <MdWindow style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="section" value={data.section || ''} required placeholder=" " maxLength={2} onChange={(e) => { dataChangeHandler("section", (e.target.value)) }} />
                                    <FloatingLabel>Enter section for new student :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={data.std || ''} required placeholder=" " onChange={(e) => { dataChangeHandler("std", Number(e.target.value)) }} />
                                    <FloatingLabel>Enter standard for new student :</FloatingLabel>
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