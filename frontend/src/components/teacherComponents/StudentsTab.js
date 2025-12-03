import styled from "styled-components"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../studentComponents/SchoolRes"
import { toast, ToastContainer } from "react-toastify"
import { DownloadBtn, StyledButton } from "../../styled-components/styledButton"
import { Label, LabelValue, PerformanceWindow, StudentInfo, StudentInfoSegment, SubInfo, TableEntry, Value } from "../studentComponents/Home"
import { Fragment, useEffect, useRef, useState } from "react"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { FaAddressCard, FaCircleUser, FaKey, FaRegCommentDots } from "react-icons/fa6";
import { RiBookShelfLine } from "react-icons/ri"
import { MdWindow } from "react-icons/md"
import { TableHeader } from "../../styled-components/TableComponents"
import { GradeCalculator } from "../../utils/gradeCalculator"
import { FaFileDownload } from "react-icons/fa"
import { jsPDF } from "jspdf";


export const TeacherInputTabContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`
export const StudentResultContainer = styled.div`
    border: 1px solid #a9a9a9ff;
    margin: 10px;
    padding: 1rem;
    display: flex;
    justify-content: center;
    flex-direction: column;
`
export const InputContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    width: inherit;
    width: 100%;
    svg{
        margin: 10px;
    }
`
export const ButtonContainer = styled.div`
    margin-right: 10px;
`

export const CommentsContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px auto;
    width: 70%;
`
export const CommentTeacher = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: left;
    width: 27%;
    border: 1px solid #a9a9a9ff;
    border-radius: 10px;
    box-shadow: 2px 2px 2px 2px #0000002a;
    padding: 5px;
    h2{
        margin: 0;
        font-weight: bold;
    }
    p{
        margin: 0;
        font-weight: 300;
    }
`
export const CommentContent = styled.div`
    display: flex;
    width: 65%;
    flex-direction: row;
    align-items: center;
    border: 1px solid #a9a9a9ff;
    border-radius: 10px;
    box-shadow: 2px 2px 2px 2px #0000002a;
    padding: 5px 10px;
    background-color: #a7caff98;

    svg{
        margin-right: 10px;
    }
`

export const DownloadHandler = async (e, studentName, content) => {
    e.preventDefault()
    const doc = new jsPDF()
    await doc.html(content).then(() => {
        doc.save(`${studentName}_result.pdf`)
    })
}

const fetchData = async (e, grNo, setter, setDisplayData, apiUrl, methodtype, dataObj, todo, errorComp, cleanup) => {
    e.preventDefault()
    console.log("main data", dataObj, "----", grNo);

    const regex = /^[A-Za-z ]*$/;
    const errarr = ["invalid gr no", "passwords are needed to be 8 digits", "standard shall have range of 1 - 12", "invalid name", "invalid section"]
    let flagarr = [false, false, false, false, false]
    if (dataObj?.studPwd !== undefined && dataObj?.studPwd !== null && (dataObj?.studPwd.toString().length !== 8)) flagarr[1] = true
    if ((grNo < 0 || grNo > 99999999) && grNo !== undefined && grNo !== null) flagarr[0] = true
    if ((dataObj?.std < 1 || dataObj?.std > 12) && dataObj?.std !== undefined && dataObj?.std !== null) flagarr[2] = true
    if (!(regex.test(dataObj?.studName)) && dataObj?.studName !== undefined && dataObj?.studName !== null && dataObj?.studName != "") flagarr[3] = true
    if (!(regex.test(dataObj?.section)) && dataObj?.section !== undefined && dataObj?.section !== null) flagarr[4] = true
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
            resp = await fetch(apiUrl + "?" + new URLSearchParams({ "studId": grNo }), {
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
                case "addStud":
                    bodyObj['grNo'] = grNo
                    bodyObj['userRole'] = "student"
                    resp = await fetch((apiUrl), {
                        method: methodtype,
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyObj),
                    });
                    break;
                case "editStud":
                    bodyObj['grNo'] = grNo
                    resp = await fetch((apiUrl), {
                        method: methodtype,
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(bodyObj),
                    });
                    break;
                case "delStud":
                    console.log(apiUrl, methodtype, { "grNo": grNo });
                    resp = await fetch((apiUrl), {
                        method: methodtype,
                        credentials: 'include',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ "grNo": grNo })
                    })
                    break;
                default:
                    break;
            }
        }
        const res = await resp.json();
        console.log(typeof (res.output));

        if (res.output) {
            setDisplayData(res.output)
            if (methodtype === "PUT") {
                successToast("updated data successfully")
            }
            if (methodtype === "DELETE") {
                successToast("deleted student successfully")
            }
            if (methodtype === "POST") {
                successToast("created student successfully")
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

export const StudentTab = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const performanceComponent = useRef(null)
    const [grNo, setGrNo] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e) => {
        setGrNo(e.target.value)
    }
    const [totalMsg, setTotalMsg] = useState("");
    useEffect(() => {
        let sum = 0
        displayData?.MarkInfo?.forEach(e => {
            console.log(Number(e.practicalMM) + Number(e.theoryMM));
            sum += Number(e.practicalMM) + Number(e.theoryMM)
        })
        const res = GradeCalculator((sum * 100) / (100 * displayData?.MarkInfo?.length))
        setTotalMsg(res)
    }, [displayData])

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, grNo, setGrNo, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/displayStud`, 'GET', {}, "fetch data", errorComp, [setGrNo]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={grNo || ''} name="grNo" required placeholder=" " onChange={(e) => { changeHandler(e) }} />
                                    <FloatingLabel>Provide Gr NO for student:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ButtonContainer>
                            <StyledButton ref={buttonComp} type="submit">Submit</StyledButton>
                        </ButtonContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
            {displayData !== undefined && displayData !== null ? <SearchOutputSection>
                {(displayData === undefined || displayData === null) ? <></> :
                    <>{(typeof displayData === 'string') ? <span style={{ padding: "10px" }}>{displayData}</span> :
                        <Fragment>
                            <StudentInfo>
                                <StudentInfoSegment>
                                    <LabelValue>
                                        <Label><strong>Name:</strong></Label>
                                        <Value>{displayData.StudData.Name}</Value>
                                    </LabelValue>
                                    <LabelValue>
                                        <Label><strong>Standard:</strong></Label>
                                        <Value>{displayData.StudData.Std}</Value>
                                    </LabelValue>
                                </StudentInfoSegment>
                                <StudentInfoSegment>
                                    <LabelValue>
                                        <Label><strong>Password:</strong></Label>
                                        <Value>{displayData.StudData.Password}</Value>
                                    </LabelValue>
                                    <LabelValue>
                                        <Label><strong>Section:</strong></Label>
                                        <Value>{displayData.StudData.Section}</Value>
                                    </LabelValue>
                                </StudentInfoSegment>
                            </StudentInfo>
                            <PerformanceWindow ref={performanceComponent}>
                                <h2 style={{ textDecoration: "underline", textDecorationColor: "#69a5ff" }}>Student Report Card</h2>
                                <div style={{ border: "1px solid #69a5ff", width: "100%" }}>
                                    <div style={{ border: "1px solid grey", margin: "10px", padding: "1rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                                        <h3>Teachers' comment</h3>
                                        {displayData.CommentInfo?.length > 0 ? <>
                                            <CommentsContainer>
                                                {displayData.CommentInfo?.map((element, index) => {
                                                    return (
                                                        <div key={index} style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", margin: "3px 0" }}>
                                                            <CommentTeacher>
                                                                <h2>{element.tName}</h2>
                                                                <p>ID:{element.tId}</p>
                                                            </CommentTeacher>
                                                            <CommentContent>
                                                                <FaRegCommentDots />
                                                                <p>Review:&nbsp;{element.comment}</p>
                                                            </CommentContent>
                                                        </div>
                                                    )
                                                })}
                                            </CommentsContainer>
                                        </> : <>No review made by any teacher</>}
                                    </div>
                                    <StudentResultContainer>
                                        <h3 style={{ textAlign: "center" }}>Academic Performance</h3>
                                        {displayData.MarkInfo?.length > 0 ? <>
                                            <SubInfo style={{ width: "100%" }}>
                                                <thead>
                                                    <tr>
                                                        <TableHeader>Subject Id</TableHeader>
                                                        <TableHeader>Subject Name</TableHeader>
                                                        <TableHeader>Practical Marks</TableHeader>
                                                        <TableHeader>Theory Marks</TableHeader>
                                                        <TableHeader>Grade</TableHeader>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {displayData.MarkInfo?.map((element, index) => {
                                                        return (
                                                            <tr key={index}>
                                                                <TableEntry>{element.subId}</TableEntry>
                                                                <TableEntry>{element.subjectName}</TableEntry>
                                                                <TableEntry>{element.practicalMM}</TableEntry>
                                                                <TableEntry>{element.theoryMM}</TableEntry>
                                                                <TableEntry>{element.grade}</TableEntry>
                                                            </tr>
                                                        )
                                                    })}
                                                </tbody>
                                            </SubInfo>
                                        </> : <>No entry of marks scroed in exam by any teacher</>}
                                    </StudentResultContainer>
                                </div>
                            </PerformanceWindow>
                            <div style={{ border: "1px solid #a9a9a9ff", display: "flex", flexDirection: "row", justifyContent: "space-between", margin: "1rem auto", alignItems: "center", width: "97%" }}>
                                <p style={{ textAlign: "left", marginLeft: "3px" }}><strong><i>Result:&nbsp;</i></strong>{totalMsg}</p>
                                <DownloadBtn onClick={(e) => { DownloadHandler(e, displayData.StudData.Name, performanceComponent.current.innerHTML) }}><FaFileDownload /> &nbsp;Download</DownloadBtn>
                            </div>
                        </Fragment>
                    }</>
                }
            </SearchOutputSection> : <></>}
        </div>
    )
}

export const StudentEditTab = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const [grNo, setGrNo] = useState(null)
    const [std, setStd] = useState(null)
    const [section, setSection] = useState(null)
    const [name, setName] = useState(null)
    const [pwd, setPwd] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e, type) => {
        switch (type) {
            case "password":
                setPwd(e.target.value)
                break;
            case "name":
                setName(e.target.value)
                break;
            case "grno":
                setGrNo(Number(e.target.value))
                break;
            case "section":
                setSection(e.target.value)
                break;
            case "std":
                setStd(Number(e.target.value))
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
                    <SearchForm onSubmit={(e) => { fetchData(e, grNo, setGrNo, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/updateStud`, 'PUT', { "studName": name, "studPwd": pwd, "section": section, "std": std }, "editStud", errorComp, [setGrNo, setName, setPwd, setSection, setStd]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="grno" value={grNo || ''} required placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "grno") }} />
                                    <FloatingLabel>Provide Gr NO for student you wish to update data:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Only fill the fields you wish to update data:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaKey style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="password" name="password" value={pwd || ''} placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "password") }} />
                                    <FloatingLabel>Provide new password :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaAddressCard style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="sname" value={name || ''} placeholder=" " onChange={(e) => { changeHandler(e, "name") }} />
                                    <FloatingLabel>Provide updated name :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <MdWindow style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" value={section || ''} name="section" placeholder=" " maxLength={2} onChange={(e) => { changeHandler(e, "section") }} />
                                    <FloatingLabel>Provide new section :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={std || ''} name="std" placeholder=" " onChange={(e) => { changeHandler(e, "std") }} />
                                    <FloatingLabel>Provide updated standard :</FloatingLabel>
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
                {typeof (displayData) === "string" ? <div style={{ padding: "10px" }}>{displayData}</div> : <></>}
            </SearchOutputSection> : <></>}
        </div>
    )
}

export const StudentDelTab = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const [grNo, setGrNo] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e) => {
        e.preventDefault()
        setGrNo(Number(e.target.value))
    }

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, grNo, setGrNo, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/delStudent`, 'DELETE', {}, "delStud", errorComp, [setGrNo]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={grNo || ''} name="grNo" required placeholder=" " onChange={(e) => { changeHandler(e) }} />
                                    <FloatingLabel>Enter Gr No of student you wish to delete:</FloatingLabel>
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
                {typeof (displayData) === "string" && (displayData !== undefined || displayData !== null) ? <div>{displayData}</div> : <></>}
            </SearchOutputSection> : <></>}
        </div>
    )
}

export const StudentAddTab = (props) => {
    const errorComp = useRef(null)
    const buttonComp = useRef(null)
    const [grNo, setGrNo] = useState(null)
    const [std, setStd] = useState(null)
    const [section, setSection] = useState(null)
    const [name, setName] = useState(null)
    const [pwd, setPwd] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e, type) => {
        switch (type) {
            case "password":
                setPwd(e.target.value)
                break;
            case "name":
                setName(e.target.value)
                break;
            case "grno":
                setGrNo(Number(e.target.value))
                break;
            case "section":
                setSection(e.target.value)
                break;
            case "std":
                setStd(Number(e.target.value))
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
                    <SearchForm onSubmit={(e) => { fetchData(e, grNo, setGrNo, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/createStud`, 'POST', { "studName": name, "studPwd": pwd, "section": section, "std": std }, "addStud", errorComp, [setGrNo, setName, setPwd, setSection, setStd]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={grNo || ''} required name="grno" placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "grno") }} />
                                    <FloatingLabel>Enter Gr No for new student :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further details for the student below:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaKey style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="password" value={pwd || ''} required name="password" placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "password") }} />
                                    <FloatingLabel>Enter Password for new student :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <FaAddressCard style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="sname" value={name || ''} required placeholder=" " onChange={(e) => { changeHandler(e, "name") }} />
                                    <FloatingLabel>Enter name for new student :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <MdWindow style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="section" value={section || ''} required placeholder=" " maxLength={2} onChange={(e) => { changeHandler(e, "section") }} />
                                    <FloatingLabel>Enter section for new student :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={std || ''} required placeholder=" " onChange={(e) => { changeHandler(e, "std") }} />
                                    <FloatingLabel>Enter standard for new student :</FloatingLabel>
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
                {typeof (displayData) === "string" ? <div style={{ padding: "10px" }}>{displayData}</div> : <></>}
            </SearchOutputSection> : <></>}
        </div>
    )
}
