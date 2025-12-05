import { useRef, useState } from "react";
import { GradeValidation, GrNoOrSubIdValidation, PasswordValidation, StringValidator, TeacherAdminIdValid } from "../../../utils/Validations";
import { FetchApi } from "../../../utils/FetchApi";
import { toast, ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/Toaster";
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes";
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp";
import { TeacherInputTabContainer } from "../TeachersTab";
import { ButtonContainer, InputContainer } from "../../teacherComponents/StudentsTab";
import { FaIdCardAlt } from "react-icons/fa";
import { FaAddressCard, FaKey } from "react-icons/fa6";
import { RiBookShelfLine, RiContactsBook2Fill } from "react-icons/ri";
import { MdWindow } from "react-icons/md";
import { StyledButton } from "../../../styled-components/styledButton";
import { roleExtractor } from "../../../utils/RoleExtractor";

export const TeacherEditComponent = (props) => {
    const errorComp = useRef(null)
    const userrole = roleExtractor(window.location.pathname)
    const [data, setData] = useState({
        tid: null,
        password: null,
        subid: null,
        tname: null,
        tstd: null,
        tsec: null
    })
    const [displayData, setDisplayData] = useState(null)
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const submitHandler = async (e, apiUrl, dataObj) => {
        e.preventDefault()
        
        const errobj = {
            "std": { "condition": false, "message": "invalid standard. Allowed range is 1 - 12" },
            "subid": { "condition": false, "message": "invalid sub id" },
            "tid": { "condition": false, "message": "invalid teacher id" },
            "section": { "condition": false, "message": "invalid section" },
            "name": { "condition": false, "message": "invalid name" },
            "pwd": { "condition": false, "message": "invalid password. it shall be of 8 digits" }
        }
        if (!TeacherAdminIdValid(dataObj?.teacherId)) errobj.tid.condition = true
        if (!(GrNoOrSubIdValidation(dataObj?.subId))) errobj.subid.condition = true
        if (!PasswordValidation(dataObj?.tPwd)) errobj.pwd.condition = true
        if (!StringValidator(dataObj?.tName)) errobj.name.condition = true
        if (!GradeValidation(dataObj?.stdAllocated)) errobj.std.condition = true
        if (!StringValidator(dataObj?.sectionAllocated)) errobj.section.condition = true
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
                    <SearchForm onSubmit={(e) => { submitHandler(e, `http://localhost:8090/${userrole}/editTeacher`, { "subId": data.subid, "tPwd": data.password, "tName": data.tname, "stdAllocated": data.tstd, "sectionAllocated": data.tsec, "teacherId": data.tid }) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaIdCardAlt style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="tid" value={data.tid || ''} required placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("tid",e.target.value) }} />
                                    <FloatingLabel>Provide Id for teacher you wish to update data:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Only fill the fields you wish to update data:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaAddressCard style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="tname" value={data.tname || ''} placeholder=" " maxLength={55} onChange={(e) => { dataChangeHandler("tname",e.target.value) }} />
                                    <FloatingLabel>Provide new name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaKey style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" maxLength={8} value={data.password || ''} name="pwd" placeholder=" " onChange={(e) => { dataChangeHandler("password",e.target.value) }} />
                                    <FloatingLabel>Provide new password here:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <RiContactsBook2Fill style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subname" value={data.subid || ''} placeholder=" " maxLength={55} onChange={(e) => { dataChangeHandler("subid",Number(e.target.value)) }} />
                                    <FloatingLabel>Provide new subject assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={data.tstd || ''} placeholder=" " onChange={(e) => { dataChangeHandler("tstd",Number(e.target.value)) }} />
                                    <FloatingLabel>Provide new standard assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <MdWindow style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="section" value={data.tsec || ''} placeholder=" " onChange={(e) => { dataChangeHandler("tsec",e.target.value) }} />
                                    <FloatingLabel>Provide new section assigned:</FloatingLabel>
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
            {displayData !== null && displayData !== undefined ? <SearchOutputSection>
                {typeof (displayData) === "string" ? <div style={{ padding: "10px" }}>{displayData}</div> : <></>}
            </SearchOutputSection> : <></>}
        </div>
    )
}