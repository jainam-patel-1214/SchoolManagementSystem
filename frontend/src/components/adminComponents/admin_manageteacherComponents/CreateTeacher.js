import { useRef, useState } from "react";
import { GradeValidation, GrNoOrSubIdValidation, isNotEmptyPair, PasswordValidation, StringValidator, TeacherAdminIdValid } from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApi";
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
import { roleExtractor } from "../../../utils/roleExtractor";


export const CreateTeacherComponent = () => {
    const errorComp = useRef(null)
    const userrole = roleExtractor(window.location.pathname)
    const initState = {
        teacherId: 0,
        tPwd: "",
        subId: 0,
        tName: "",
        stdAllocated: 0,
        sectionAllocated: ""
    }
    const [data, setData] = useState(initState)
    const [displayData, setDisplayData] = useState(null)

    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const submitHandler = async (e, apiUrl) => {
        e.preventDefault()
        const errobj = {
            "std": { "condition": false, "message": "invalid standard. Allowed range is 1 - 12" },
            "subid": { "condition": false, "message": "invalid sub id" },
            "tid": { "condition": false, "message": "invalid teacher id" },
            "section": { "condition": false, "message": "invalid section" },
            "name": { "condition": false, "message": "invalid name" },
            "pwd": { "condition": false, "message": "invalid password. it shall be of 8 digits" }
        }
        if (!TeacherAdminIdValid(data.teacherId)) errobj.tid.condition = true
        if (data.subId!==0&&!(GrNoOrSubIdValidation(data.subId))) errobj.subid.condition = true
        if (data.tPwd===""||!PasswordValidation(data.tPwd)) errobj.pwd.condition = true
        if (data.tName===""||!StringValidator(data.tName)) errobj.name.condition = true
        if (data.stdAllocated!==0&&!GradeValidation(data.stdAllocated)) errobj.std.condition = true
        if (data.sectionAllocated!==""&&!StringValidator(data.sectionAllocated)) errobj.section.condition = true
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
            for (const [key, value] of Object.entries(data)) {
                if (isNotEmptyPair(value)) {
                    bodyObj[key] = value
                }
            }
            bodyObj["role"]="teacher"
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
                    <SearchForm onSubmit={(e) => { submitHandler(e, `http://localhost:8090/${userrole}/addTeacher`)}}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaIdCardAlt style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.teacherId || ''} name="tid" required placeholder=" " maxLength={8} onChange={(e) => { dataChangeHandler("teacherId", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide Id for new teacher to be created:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Provide further details of teacher:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaAddressCard style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" required value={data.tName || ''} name="tname" placeholder=" " maxLength={55} onChange={(e) => { dataChangeHandler("tName", e.target.value) }} />
                                    <FloatingLabel>Provide teacher's name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaKey style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" required maxLength={8} value={data.tPwd || ''} name="pwd" placeholder=" " onChange={(e) => { dataChangeHandler("tPwd", e.target.value) }} />
                                    <FloatingLabel>Provide a password:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <RiContactsBook2Fill style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subname" value={data.subId || ''} placeholder=" " maxLength={55} onChange={(e) => { dataChangeHandler("subId", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide subject to be assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={data.stdAllocated || ''} placeholder=" " onChange={(e) => { dataChangeHandler("stdAllocated", Number(e.target.value)) }} />
                                    <FloatingLabel>Provide standard to be assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <MdWindow style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="section" value={data.sectionAllocated || ''} placeholder=" " onChange={(e) => { dataChangeHandler("sectionAllocated", e.target.value) }} />
                                    <FloatingLabel>Provide section to be assigned:</FloatingLabel>
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