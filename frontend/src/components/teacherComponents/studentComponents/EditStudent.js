import { useRef, useState } from "react"
import { GradeValidation, GrNoOrSubIdValidation, PasswordValidation, StringValidator } from "../../../utils/Validations"
import { FetchApi } from "../../../utils/FetchApi"
import { toast, ToastContainer } from "react-toastify"
import { ErrorToast, Toaster } from "../../../utils/Toaster"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp"
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../StudentsTab"
import { FaAddressCard, FaCircleUser, FaKey } from "react-icons/fa6"
import { MdWindow } from "react-icons/md"
import { RiBookShelfLine } from "react-icons/ri"
import { StyledButton } from "../../../styled-components/styledButton"
import { roleExtractor } from "../../../utils/RoleExtractor"

export const StudentEditComponent = () => {
    const errorComp = useRef(null)
    const userrole = roleExtractor(window.location.pathname)
    const initState = {
        grNo: 0,
        std: 0,
        section: "",
        name: "",
        pwd: ""
    }
    const [data, setData] = useState(initState)
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
            res = await FetchApi(apiUrl, "PUT", bodyObj)
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
                    <SearchForm onSubmit={(e) => { sumbitHandler(e, `http://localhost:8090/${userrole}/updateStud`, { "grNo": data.grNo, "studName": data.name, "studPwd": data.pwd, "section": data.section, "std": data.std }) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="grno" value={data.grNo || ''} required placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("grNo", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide Gr NO for student you wish to update data:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Only fill the fields you wish to update data:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaKey style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="password" name="password" value={data.pwd || ''} placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("pwd", e.target.value) }} />
                                    <FloatingLabel>Provide new password :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaAddressCard style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="sname" value={data.name || ''} placeholder=" " onChange={(e) => { dataChangeHandler("name", e.target.value) }} />
                                    <FloatingLabel>Provide updated name :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <MdWindow style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" value={data.section || ''} name="section" placeholder=" " maxLength={2} onChange={(e) => { dataChangeHandler("section", e.target.value) }} />
                                    <FloatingLabel>Provide new section :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.std || ''} name="std" placeholder=" " onChange={(e) => { dataChangeHandler("std", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide updated standard :</FloatingLabel>
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