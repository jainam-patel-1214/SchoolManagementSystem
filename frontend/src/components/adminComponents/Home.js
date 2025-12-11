import styled from "styled-components"
import { useState, useEffect, useRef, Fragment } from "react"
import { LabelValue, StudentHomeSection, StudentInfo } from "../studentComponents/Home"
import { ToastContainer, toast } from "react-toastify"
import { ErrorSpan, SearchForm } from "../studentComponents/SchoolRes"
import { StyledNavbar } from "../../styled-components/StyledNav"
import imgpfp from '../../assets/pfp.webp'
import { ErrorToast, SuccessToast, Toaster } from "../../utils/Toaster"
import { fetchApi } from "../../utils/fetchApi"
import { roleExtractor } from "../../utils/roleExtractor"
import { createColumnHelper } from "@tanstack/react-table"
import { RequestsTableComponent } from "../helperComponents/RequestsTable"
import { TeacherInputTabContainer } from "./TeachersTab"
import { InputContainer } from "../teacherComponents/StudentsTab"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { TiSortAlphabetically } from "react-icons/ti"
import { RiBookShelfLine } from "react-icons/ri"
import { adminRequestFieldValidator } from "../../utils/acceptRequestValidator"

export const AdminHome = () => {
    const [displayData, setDisplayData] = useState({})

    useEffect(() => {
        const role = roleExtractor(window.location.pathname)
        const fetchData = async () => {
            try {
                const res = await fetchApi(`http://localhost:8090/${role}/data`, 'GET', {})
                setDisplayData(res.output);
            } catch (err) {
                ErrorToast(err, toast)
            }
        };
        fetchData()
    }, []);

    return (
        <div>
            <StudentHomeSection>
                < ToastContainer />
                <StudentInfo style={{ width: "100%" }}>
                    <div style={{ display: "flex", justifyContent: "center", flexDirection: "column", padding: "1rem" }}>
                        <h3 style={{ marginBottom: "1rem" }}><strong>User Profile:</strong></h3>
                        <StyledNavbar variant="inbody">
                            <div>
                                <img src={imgpfp} alt="pfp" style={{ height: "100px", width: "100px", objectFit: "contain" }}></img>
                                <LabelValue>
                                    <p style={{ margin: "1rem auto" }}><strong>{displayData.Name}</strong></p>
                                </LabelValue>
                            </div>
                            <div>
                                <LabelValue>
                                    <p><strong>Id:</strong></p>
                                    <p>{displayData.Id}</p>
                                </LabelValue>
                                <LabelValue>
                                    <p><strong>Password:</strong></p>
                                    <p>{displayData.Password}</p>
                                </LabelValue>
                            </div>
                        </StyledNavbar>
                    </div>
                </StudentInfo>
            </StudentHomeSection>
        </div>
    )
}


const PendingReqSection = styled.div`
    display: flex;
    flex-direction: column;
    padding: 1rem;
`
const PendingBtnComp = styled.button`
    background-color: lightgreen;
    padding: 1rem;
    margin: .5rem;
    border: 1px double lightgreen;
    &:hover{
        background-color: ${(props)=>{return props.variant==='accept'?"#15d200ff":"#ff4f4fff"}};
        cursor: pointer;
    }
    background-color: ${(props)=>{return props.variant==='accept'?"lightgreen":"red"}};
`

const Overlay = styled.div`
    position: absolute;
    top: 0; 
    left: 0;
    width: 100vw;
    height: 100vh;
    backdrop-filter: blur(6px);
    background: rgba(255, 255, 255, 0.28);
    display: none;
    z-index: 9;    
`
const DetailsForm = styled.div`
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    width: 65%;
    transform: translate(-50%, -50%);
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    z-index: 10;
`
const CloseBtn = styled.button`
    position: absolute;
    background-color: red;
    top: 8px;
    right: 8px;
    padding: 5px 10px;
    &:hover{
        background-color: ${(props)=>{return props.variant==='accept'?"#15d200ff":"#ff4f4fff"}};
        cursor: pointer;
    }
`


export const AdminPendingReqTab = () => {
    const ErrorComponent = useRef(null)
    const initState = {
        id: 0,
        name: "",
        password: "",
        role: "",
        pendingId: null,
        subjectId: 0,
        std: 0,
        section: ""
    }
    const [data, setData] = useState(initState)
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const emptyDataHandler = () => {
        setIsStudent(false)
        setIsTeacher(false)
        setData(initState);
    }

    const [isStudent, setIsStudent] = useState(false)
    const [isTeacher, setIsTeacher] = useState(false)
    const [displayData, setDisplayData] = useState([])
    const [styleDisplay,setStyleDisplay] = useState(false)
    const userrole = roleExtractor(window.location.pathname)

    const handleAccept = async (e,v) => {
        e.preventDefault()
        let userName=v.userName
        let userPwd=v.pwd
        let userRole=v.roleReq
        let pend=v.pendingId
        if (userRole === "student") setIsStudent(true);
        if (userRole === "teacher") setIsTeacher(true);
        dataChangeHandler("pendingId", Number(pend))
        dataChangeHandler("name", userName)
        dataChangeHandler("password", userPwd)
        dataChangeHandler("role", userRole)
        setStyleDisplay(true)
        document.querySelector("body").style.overflow = "hidden"

    }
    const handleReject = async (e,v) => {
        e.preventDefault()
        let userName=v.userName
        let userPwd=v.pwd
        let userRole=v.roleReq
        let pend= v.pendingId
        try {
            const temp = { "pendingId": Number(pend), "uName": userName, "uPwd": userPwd, "uRole": userRole }
            const res = await fetchApi(`http://localhost:8090/${userrole}/rejectRequest`, 'DELETE', temp)
            if (res.output) {
                SuccessToast("Rejected !!",toast)
                emptyDataHandler()
                fetchPendingApps()
            }
        } catch (error) {
            ErrorToast(error, toast);
        }
    }
    const handleHide = (e) => {
        e.preventDefault()
        emptyDataHandler()
        setStyleDisplay(false)
        document.querySelector("body").style.overflow = "auto"
    }

    const overlayDisplayObj = {
        display: styleDisplay?"block":"none"
    }
    const popupDisplayObj ={
        display: styleDisplay?"flex":"none"
    }

    const handleSubmitForm = async (e) => {
        e.preventDefault()
        let temp;
        if(Number(data?.pendingId)===0||data?.name===""||data?.password === "" || data?.role===""){
            ErrorToast("some error occured please try again.")
            return
        }
        if (isStudent) {
            temp = { "pendingId": Number(data.pendingId), "uName": data.name, "uPwd": data.password, "uRole": data.role, "Uid": Number(data.id), "std": Number(data.std), "section": data.section }
            adminRequestFieldValidator(temp,toast)
        } else if (isTeacher) {
            temp = { "pendingId": Number(data.pendingId), "uName": data.name, "uPwd": data.password, "uRole": data.role, "Uid": Number(data.id), "std": Number(data.std), "section": data.section, "subId": data.subjectId }
            adminRequestFieldValidator(temp,toast)
        } else if (!isStudent && !isTeacher) {
            temp = { "pendingId": Number(data.pendingId), "uName": data.name, "uPwd": data.password, "uRole": data.role, "Uid": Number(data.id) }
            adminRequestFieldValidator(temp,toast)
        }
        
        try {
            const res = await fetchApi(`http://localhost:8090/${userrole}/acceptRequest`, 'POST', temp)
            Toaster(res, toast)
        } catch (error) {
            ErrorToast(error, toast);
        } finally {
            handleHide(e)
            setStyleDisplay(false)
            emptyDataHandler()
            fetchPendingApps()
            e.target.reset()
        }
    }
    const fetchPendingApps = async () => {
        try {
            const res = await fetchApi(`http://localhost:8090/${userrole}/pendingRequest`, 'GET', {})
            if (typeof (res.output) === "string") {
                SuccessToast(res.output, toast)
            } else {
                setDisplayData(res.output)
            }
        } catch (err) {
            ErrorToast(err, toast)
        }
    }
    useEffect(() => {
        fetchPendingApps()
    }, [])

    const columnHelper = createColumnHelper();
    const columns = [
        columnHelper.accessor("roleReq", {
            header: "Role requested",
            cell: info => info.getValue(),
            enableSorting: false
        }),

        columnHelper.accessor("userName", {
            header: "Name",
            cell: info => info.getValue(),
            enableSorting: true
        }),

        columnHelper.accessor("pwd", {
            header: "Password",
            cell: info => info.getValue(),
            enableSorting: false
        }),

        columnHelper.display({
            id: "accept",
            header: "Accept",
            cell: ({ row }) => {
                const v = row.original;
                return (
                    <PendingBtnComp
                        type="button"
                        variant={"accept"}
                        onClick={(e) => handleAccept(e,v)}
                    >
                        Accept
                    </PendingBtnComp>
                );
            },
        }),

        columnHelper.display({
            id: "reject",
            header: "Reject",
            cell: ({ row }) => {
                const v = row.original;
                return (
                    <PendingBtnComp
                        type="button"
                        variant={"reject"}
                        onClick={(e) => handleReject(e,v)}
                    >
                        Reject
                    </PendingBtnComp>
                );
            },
        }),
    ];

    return (
        <>
            <Overlay style={overlayDisplayObj}></Overlay>
            <PendingReqSection>
                <PopoupComponent componentStyle={popupDisplayObj} close={handleHide} isTeach={isTeacher} isStud={isStudent} submitHandler={handleSubmitForm} errComp={ErrorComponent} data={data} newHandler={dataChangeHandler}></PopoupComponent>
                {displayData?.length > 0 ?
                    < RequestsTableComponent heading={"Pending user requests"} data={displayData} columnDefinition={columns} />
                    : <>There are no pending applications</>}
            </PendingReqSection>
        </>
    )
}

const PopoupComponent = ({
    componentStyle,
    close,
    isTeach,
    isStud,
    submitHandler,
    errComp,
    data,
    newHandler
}) => {
    return (
        <DetailsForm style={componentStyle}>
            <SearchForm onSubmit={(e) => { submitHandler(e) }} style={{ width: "100%" }}>
                <TeacherInputTabContainer>
                    <InputContainer style={{ width: "100%" }}>
                        <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                        <InputWrapper>
                            <FloatingInput type="text" maxLength={8} name="uid" value={data.id || ''} placeholder=" " onChange={(e) => { newHandler("id", (e.target.value)) }} required />
                            <FloatingLabel>Provide unique {isStud ? "student" : isTeach ? "teacher" : "admin"} id:</FloatingLabel>
                        </InputWrapper>
                    </InputContainer>
                </TeacherInputTabContainer>
                {isTeach ? <TeacherInputTabContainer>
                    <InputContainer style={{ width: "100%" }}>
                        <TiSortAlphabetically style={{ fontSize: "xx-large" }} />
                        <InputWrapper>
                            <FloatingInput type="number" value={data.subjectId || ''} name="sub" placeholder=" " onChange={(e) => { newHandler("subjectId", Number(e.target.value)) }} />
                            <FloatingLabel>Provide sub id if teacher is assigned one:</FloatingLabel>
                        </InputWrapper>
                    </InputContainer>
                </TeacherInputTabContainer> : <></>}
                {isStud || isTeach ? <Fragment>
                    <TeacherInputTabContainer>
                        <InputContainer style={{ width: "100%" }}>
                            <TiSortAlphabetically style={{ fontSize: "xx-large" }} />
                            <InputWrapper>
                                <FloatingInput type="number" value={data.std || ''} name="std" placeholder=" " onChange={(e) => { newHandler("std", Number(e.target.value)) }} />
                                <FloatingLabel>Provide standard:</FloatingLabel>
                            </InputWrapper>
                        </InputContainer>
                    </TeacherInputTabContainer>
                    <TeacherInputTabContainer>
                        <InputContainer style={{ width: "100%" }}>
                            <TiSortAlphabetically style={{ fontSize: "xx-large" }} />
                            <InputWrapper>
                                <FloatingInput type="text" value={data.section || ''} name="section" placeholder=" " onChange={(e) => { newHandler("section", (e.target.value)) }} />
                                <FloatingLabel>Provide section:</FloatingLabel>
                            </InputWrapper>
                        </InputContainer>
                    </TeacherInputTabContainer>
                </Fragment> : <></>}
                <PendingBtnComp type="submit" variant={"accept"}>Submit</PendingBtnComp>
                <ErrorSpan ref={errComp}></ErrorSpan>
                <CloseBtn id="closeBtn" type="reset" onClick={(e) => { close(e) }}>X</CloseBtn>
            </SearchForm>
        </DetailsForm>
    )
}