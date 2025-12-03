import styled from "styled-components"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../studentComponents/SchoolRes"
import { toast, ToastContainer } from "react-toastify"
import { StyledButton } from "../../styled-components/styledButton"
import { PerformanceWindow, SubInfo, TableEntry } from "../studentComponents/Home"
import { useRef, useState } from "react"
import { ButtonContainer, InputContainer } from "../teacherComponents/StudentsTab"
import { GiTeacher } from "react-icons/gi"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { FaIdCardAlt } from "react-icons/fa"
import { FaAddressCard, FaKey } from "react-icons/fa6"
import { RiBookShelfLine, RiContactsBook2Fill } from "react-icons/ri"
import { MdWindow } from "react-icons/md"
import { TableHeader } from "../../styled-components/TableComponents"

export const TeacherInputTabContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`

const fetchData = async (e, tid, setTid, setDisplayData, apiUrl, methodtype, dataObj, todo, errorComp, cleanup) => {
    e.preventDefault()
    const regex = /^[A-Za-z ]*$/;
    const errarr = ["invalid teacher id", "password must be 8 digits", "name shall only have alphabets", "invalid subject id", "invalid grade. Allowed range is 1 - 12", "invalid section"]
    let flagarr = [false, false, false, false, false]
    if ((tid?.length < 1 || tid?.length > 8) && tid !== null && tid !== undefined) flagarr[0] = true
    if ((dataObj.subId < 0 || dataObj.subId > 99999999) && dataObj.subId !== undefined && dataObj.subId !== null) flagarr[3] = true
    if ((dataObj.tPwd?.length !== 8) && dataObj.tPwd !== undefined && dataObj.tPwd !== null) flagarr[1] = true
    if (!(regex.test(dataObj.tName)) && dataObj.tName !== undefined && dataObj.tName !== null) flagarr[2] = true
    if ((dataObj.stdAllocated < 1 || dataObj.stdAllocated > 12) && dataObj.stdAllocated !== undefined && dataObj.stdAllocated !== null) flagarr[4] = true
    if (!(regex.test(dataObj.sectionAllocated)) && dataObj.sectionAllocated !== undefined && dataObj.sectionAllocated !== null) flagarr[5] = true
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
        let resp;
        if (methodtype === "GET") {
            resp = await fetch(apiUrl, {
                method: 'GET',
                credentials: 'include',
            });
        } else {
            let bodyObj = {}
            for (const [key, value] of Object.entries(dataObj)) {
                console.log(key, value);
                if (value !== null && value !== undefined) {
                    bodyObj[key] = value
                }
            }
            switch (todo) {
                case "addTeach":
                    // bodyObj = {}
                    bodyObj["teacherId"] = tid
                    bodyObj["role"] = "teacher"
                    resp = await fetch((apiUrl), {
                        method: methodtype,
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyObj),
                    });
                    break;
                case "editTeach":
                    // bodyObj = {}
                    // for (const [key, value] of Object.entries(dataObj)) {
                    //     console.log(key, value);
                    //     if (value !== null && value !== undefined) {
                    //         bodyObj[key] = value
                    //     }
                    // }
                    bodyObj["teacherId"] = tid
                    resp = await fetch((apiUrl), {
                        method: methodtype,
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyObj),
                    });
                    break;
                case "delTeach":
                    resp = await fetch((apiUrl), {
                        method: methodtype,
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ "teacherId": tid })
                    })
                    break;
                default:
                    break;
            }
        }
        const res = await resp.json();
        console.log(res);

        if (res.output) {
            setDisplayData(res.output)
            if (methodtype === "PUT") {
                successToast("updated data successfully")
            }
            if (methodtype === "DELETE") {
                successToast("deleted teacher successfully")
            }
            if (methodtype === "POST") {
                successToast("created teacher successfully")
            }
            if (methodtype === "GET") {
                successToast("fetched data successfully")
            }
            return
        }
        if (res.error) {
            errorToast(res.error)
            return
        }
    } catch (err) {
        // console.log(err.error);
        errorToast(err.error)
    } finally {
        cleanup.forEach(e => e(null))
        e.target.reset();
    }
};

const successToast = (str) => {
    toast.success(str || "fetch successful", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });
}
const errorToast = (str) => {
    toast.error(str || "Something went wrong", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
    });
}

export const TeacherPerformance = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const [tid, setTid] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e) => {
        setTid(e.target.value)
    }

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, tid, setTid, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/displayTeacherPerformance/${tid}`, "GET", {}, "fetch data", errorComp, [setTid]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <GiTeacher style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" value={tid || ''} name="teacherid" placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e) }} />
                                    <FloatingLabel>Provide id of teacher you wish to look performance:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton ref={buttonComp} type="submit">Submit</StyledButton>
                        </ButtonContainer>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
            {displayData !== undefined && displayData !== null ? <SearchOutputSection>
                {(typeof displayData === 'string') ? <>{displayData}</> :
                    <PerformanceWindow>
                        {displayData?.length > 0 ? <>
                            <h2>Performance among teacher's peers</h2>
                                <div style={{ border: "1px solid #a9a9a9ff", margin: "10px", padding: "1rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                    <SubInfo style={{ width: "100%" }}>
                                        <thead>
                                            <tr>
                                                <TableHeader>Teacher Id</TableHeader>
                                                <TableHeader>Teacher Name</TableHeader>
                                                <TableHeader>Standard Allocated</TableHeader>
                                                <TableHeader>Subject Allocated</TableHeader>
                                                <TableHeader>Total Practical Marks</TableHeader>
                                                <TableHeader>Total Theory Marks</TableHeader>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {displayData?.map((element, index) => {
                                                return (
                                                    <tr key={index}>
                                                        <TableEntry>{element.Tid}</TableEntry>
                                                        <TableEntry>{element.TName}</TableEntry>
                                                        <TableEntry>{element.StdAllocated}</TableEntry>
                                                        <TableEntry>{element.SubName}</TableEntry>
                                                        <TableEntry>{element.TotalPracticalMarks}</TableEntry>
                                                        <TableEntry>{element.TotalTheoryMarks}</TableEntry>
                                                    </tr>
                                                )
                                            })}
                                        </tbody>
                                    </SubInfo>
                                </div>
                        </> : displayData === null || displayData === undefined ? <></> : <>No performance data</>}
                    </PerformanceWindow>
                }
            </SearchOutputSection> : <></>}
        </div>
    )
}

export const TeacherEditTab = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const [tId, setTid] = useState(null)
    const [password, setPassword] = useState(null)
    const [subId, setsubId] = useState(null)
    const [name, setName] = useState(null)
    const [std, setStd] = useState(null)
    const [section, setSection] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e, type) => {
        switch (type) {
            case "subid":
                setsubId(Number(e.target.value))
                break;
            case "name":
                setName(e.target.value)
                break;
            case "std":
                setStd(Number(e.target.value))
                break;
            case "section":
                setSection(e.target.value)
                break;
            case "tid":
                setTid(e.target.value)
                break;
            case "pwd":
                setPassword(e.target.value)
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
                    <SearchForm onSubmit={(e) => { fetchData(e, tId, setTid, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/editTeacher`, 'PUT', { "subId": subId, "tPwd": password, "tName": name, "stdAllocated": std, "sectionAllocated": section }, "editTeach", errorComp, [setName, setPassword, setSection, setStd, setTid, setsubId]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaIdCardAlt style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="tid" value={tId || ''} required placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "tid") }} />
                                    <FloatingLabel>Provide Id for teacher you wish to update data:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Only fill the fields you wish to update data:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaAddressCard style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="tname" value={name || ''} placeholder=" " maxLength={55} onChange={(e) => { changeHandler(e, "name") }} />
                                    <FloatingLabel>Provide new name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaKey style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" maxLength={8} value={password || ''} name="pwd" placeholder=" " onChange={(e) => { changeHandler(e, "pwd") }} />
                                    <FloatingLabel>Provide new password here:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <RiContactsBook2Fill style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subname" value={subId || ''} placeholder=" " maxLength={55} onChange={(e) => { changeHandler(e, "subid") }} />
                                    <FloatingLabel>Provide new subject assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={std || ''} placeholder=" " onChange={(e) => { changeHandler(e, "std") }} />
                                    <FloatingLabel>Provide new standard assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <MdWindow style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="section" value={section || ''} placeholder=" " onChange={(e) => { changeHandler(e, "section") }} />
                                    <FloatingLabel>Provide new section assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton ref={buttonComp} type="submit">Submit</StyledButton>
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

export const TeacherDelTab = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const [tId, setTid] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e) => {
        setTid(e.target.value)
    }

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, tId, setTid, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/delTeacher`, "DELETE", {}, "delTeach", errorComp, [setTid]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaIdCardAlt style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="tid" value={tId || ''} required placeholder=" " onChange={(e) => { changeHandler(e) }} />
                                    <FloatingLabel>Provide id of teacher you wish to delete:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton ref={buttonComp} type="submit">Submit</StyledButton>
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

export const TeacherAddTab = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const [tId, setTid] = useState(null)
    const [password, setPassword] = useState(null)
    const [subId, setsubId] = useState(null)
    const [name, setName] = useState(null)
    const [std, setStd] = useState(null)
    const [section, setSection] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e, type) => {
        switch (type) {
            case "subid":
                setsubId(Number(e.target.value))
                break;
            case "name":
                setName(e.target.value)
                break;
            case "std":
                setStd(Number(e.target.value))
                break;
            case "section":
                setSection(e.target.value)
                break;
            case "tid":
                setTid(e.target.value)
                break;
            case "pwd":
                setPassword(e.target.value)
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
                    <SearchForm onSubmit={(e) => { fetchData(e, tId, setTid, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/addTeacher`, 'POST', { "subId": subId, "tPwd": password, "tName": name, "stdAllocated": std, "sectionAllocated": section }, "addTeach", errorComp, [setName, setPassword, setSection, setStd, setTid, setsubId]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaIdCardAlt style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" value={tId || ''} name="tid" required placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "tid") }} />
                                    <FloatingLabel>Provide Id for new teacher to be created:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Provide further details of teacher:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaAddressCard style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" required value={name || ''} name="tname" placeholder=" " maxLength={55} onChange={(e) => { changeHandler(e, "name") }} />
                                    <FloatingLabel>Provide teacher's name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaKey style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" required maxLength={8} value={password || ''} name="pwd" placeholder=" " onChange={(e) => { changeHandler(e, "pwd") }} />
                                    <FloatingLabel>Provide a password:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <RiContactsBook2Fill style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subname" value={subId || ''} placeholder=" " maxLength={55} onChange={(e) => { changeHandler(e, "subid") }} />
                                    <FloatingLabel>Provide subject to be assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={std || ''} placeholder=" " onChange={(e) => { changeHandler(e, "std") }} />
                                    <FloatingLabel>Provide standard to be assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <MdWindow style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="section" value={section || ''} placeholder=" " onChange={(e) => { changeHandler(e, "section") }} />
                                    <FloatingLabel>Provide section to be assigned:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton ref={buttonComp} type="submit">Submit</StyledButton>
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
