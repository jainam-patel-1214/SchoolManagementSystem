import styled from "styled-components"
import { useState, useEffect, useRef } from "react"
import { Label, LabelValue, StudentHomeSection, StudentInfo, SubInfo, TableEntry, Value } from "../studentComponents/Home"
import { ToastContainer, toast } from "react-toastify"
import { ErrorSpan, SearchForm } from "../studentComponents/SchoolRes"
import { StyledNavbar } from "../../styled-components/styledNav"
import imgpfp from '../../assets/pfp.webp'
import { ErrorToast, SuccessToast, Toaster } from "../../utils/Toaster"
import { FetchApi } from "../../utils/FetchApi"
import { roleExtractor } from "../../utils/RoleExtractor"

export const AdminHome = (props) => {
    const [displayData, setDisplayData] = useState({})

    useEffect(() => {
        const role = roleExtractor(window.location.pathname)
        const fetchData = async () => {
            try {
                const res = await FetchApi(`http://localhost:8090/${role}/data`,'GET',{})
                setDisplayData(res.output);
            } catch (err) {
                ErrorToast(err,toast)
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
                                    <Value style={{ margin: "1rem auto" }}><strong>{displayData.Name}</strong></Value>
                                </LabelValue>
                            </div>
                            <div>
                                <LabelValue>
                                    <Label><strong>Id:</strong></Label>
                                    <Value>{displayData.Id}</Value>
                                </LabelValue>
                                <LabelValue>
                                    <Label><strong>Password:</strong></Label>
                                    <Value>{displayData.Password}</Value>
                                </LabelValue>
                            </div>
                        </StyledNavbar>
                    </div>
                </StudentInfo>
            </StudentHomeSection>
        </div>
    )
}


export const PendingReqSection = styled.div`
    display: flex;
    flex-direction: column;
    padding: 1rem;
    border: 1px double blue;
`
export const PendingReqTab = styled.div`
    display: flex;
    flex-direction: row;
    padding: 1rem;
    justify-content: space-between;
    align-items: center;
    margin: .3rem;
    border: 1px solid blue;
`
export const AcceptBtn = styled.button`
    background-color: lightgreen;
    padding: 1rem;
    margin: .5rem;
    border: 1px double lightgreen;
    &:hover{
        background-color: #15d200ff;
        cursor: pointer;
    }
    
`
export const RejectBtn = styled.button`
    background-color: red;
    padding: 1rem;
    margin: .5rem;
    border: 1px double red;
    &:hover{
        background-color: #ff4f4fff;
        cursor: pointer;
    }
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
const PopupDiv = styled.div`
    display: flex;
    justify-content: space-between;
    margin: 1rem; 
    align-items: center;
    width:100%;
`

const SpanComp = styled.span`
    width: 40%;
    display: flex;
    margin-right: 2rem;
    flex-direction: column;
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
    top: 8px;
    right: 8px;
    padding: 5px 10px;
    cursor: pointer;
`


export const AdminPendingReqTab = (props) => {
    const overlayComp = useRef(null)
    const detailsComp = useRef(null)
    const ErrorComponent = useRef(null)
    const SubmitButtonComponent = useRef(null)

    const [data,setData] = useState()

    const [id, setId] = useState(null)
    const [name, setName] = useState(null)
    const [pwd, setPwd] = useState(null)
    const [role, setRole] = useState(null)
    const [pendId, setPendid] = useState(null)
    const [subid, setSubid] = useState(null)
    const [std, setStd] = useState(null)
    const [section, setSection] = useState(null)
    const [validateErr, setValidateErr] = useState(false)
    const [isStudent, setstud] = useState(false)
    const [isTeacher, setteach] = useState(false)
    const [displayData, setDisplayData] = useState([])

    const stateChange = (e, type) => {
        e.preventDefault()
        switch (type) {
            case "subid":
                // console.log(name, pwd, role);
                setSubid(Number(e.target.value))
                break;
            case "grade":
                // console.log(name, pwd, role);
                setStd(Number(e.target.value))
                break;
            case "section":
                // console.log(name, pwd, role);
                setSection(e.target.value)
                break;
            case "uid":
                // console.log(name, pwd, role);
                if (isStudent) {
                    setId(Number(e.target.value))
                } else if (isTeacher) {
                    setId(e.target.value)
                } else setId(e.target.value)

                break;
            default:
                break;
        }
    }
    const handleAccept = async (e) => {
        e.preventDefault()
        const name = e.target.getAttribute("userName");
        const pwd = e.target.getAttribute("userPwd");
        const role = e.target.getAttribute("userRole");
        const pId = e.target.getAttribute("pend");

        if (role === "student") setstud(true);
        if (role === "teacher") setteach(true);
        setPendid(Number(pId));
        setName(name); setPwd(pwd); setRole(role)
        overlayComp.current.style.display = "block"
        detailsComp.current.style.display = "flex"
        document.querySelector("body").style.overflow = "hidden"

    }
    const handleReject = async (e) => {
        e.preventDefault()
        const name = e.target.getAttribute("userName");
        const pwd = e.target.getAttribute("userPwd");
        const role = e.target.getAttribute("userRole");
        const pId = Number(e.target.getAttribute("pend"));
        try {
            const temp = { "pendingId": pId, "uName": name, "uPwd": pwd, "uRole": role }
            const res = await FetchApi(`http://localhost:8090/${props.roleOfPerson}/rejectRequest`, 'DELETE', temp)
            Toaster(res, toast)
            if (res.output) {
                emptystates()
                fetchPendingApps()
            }
        } catch (error) {
            ErrorToast(error,toast);
        }
    }
    const handleHide = () => {
        overlayComp.current.style.display = "none"
        detailsComp.current.style.display = "none"
        document.querySelector("body").style.overflow = "auto"
        emptystates()
    }

    const handleSubmitForm = async (e) => {
        e.preventDefault()
        let temp;
        if (isStudent) {
            temp = { "pendingId": pendId, "uName": name, "uPwd": pwd, "uRole": role, "Uid": id, "std": std, "section": section }
        } else if (isTeacher) {
            temp = { "pendingId": pendId, "uName": name, "uPwd": pwd, "uRole": role, "Uid": id, "std": std, "section": section, "subId": subid }
        } else if (!isStudent && !isTeacher) {
            temp = { "pendingId": pendId, "uName": name, "uPwd": pwd, "uRole": role, "Uid": id }
        }
        try {
            console.log(temp);
            const res = await FetchApi(`http://localhost:8090/${props.roleOfPerson}/acceptRequest`, 'POST', temp)
            Toaster(res, toast)
        } catch (error) {
            ErrorToast(error, toast);
        }finally{
            handleHide()
            emptystates()
            fetchPendingApps()
            e.target.reset()
        }
    }
    const emptystates = () => {
        setName(null); setPwd(null); setRole(null); setId(null); setSubid(null); setStd(null); setSection(null); setstud(false); setteach(false); setPendid(null)
    }
    const fetchPendingApps = async () => {
        try {
            const res = await FetchApi(`http://localhost:8090/${props.roleOfPerson}/pendingRequest`,'GET',{})
            if (typeof (res.output) === "string") {
                SuccessToast(res.output,toast)
            } else {
                setDisplayData(res.output)
            }
        } catch (err) {
            ErrorToast(err,toast)
        }
    }
    useEffect(() => {
        fetchPendingApps()
    }, [])
    return (
        <>
            <Overlay ref={overlayComp}></Overlay>
            <PendingReqSection>
                <Popoup refprop={detailsComp} close={handleHide} changeHandler={stateChange} isteach={isTeacher} isStud={isStudent} submitHandler={handleSubmitForm} setvalidation={setValidateErr} validation={validateErr} userId={id} userStd={std} userSec={section} userSub={subid} errComp={ErrorComponent} btnComp={SubmitButtonComponent}></Popoup>
                {displayData?.length > 0 ?
                    <SubInfo style={{ border: "1px solid black", width: "100%" }}>
                        <thead>
                            <tr>
                                <th>Role requested</th>
                                <th>Name</th>
                                <th>Password</th>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData?.map((v, i) => {
                                return (
                                    <tr key={i}>
                                        <TableEntry>{v.roleReq}</TableEntry>
                                        <TableEntry>{v.userName}</TableEntry>
                                        <TableEntry>{v.pwd}</TableEntry>
                                        <TableEntry><AcceptBtn userName={v.userName} userPwd={v.pwd} userRole={v.roleReq} pend={v.pendingId} type="button" onClick={(e) => { handleAccept(e) }}>Accept</AcceptBtn></TableEntry>
                                        <TableEntry><RejectBtn userName={v.userName} userPwd={v.pwd} userRole={v.roleReq} pend={v.pendingId} type="button" onClick={(e) => { handleReject(e) }}> Reject</RejectBtn></TableEntry>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </SubInfo>
                    : <>There are no pending applications</>}
            </PendingReqSection>
        </>
    )
}

const Popoup = (props) => {
    return (
        <DetailsForm ref={props.refprop}>
            <SearchForm onSubmit={(e) => { props.submitHandler(e) }} style={{ width: "100%" }}>
                <PopupDiv>
                    <SpanComp style={{ width: "50%" }}>
                        <label htmlFor="uid">
                            Provide unique {props.isStud ? "student" : props.isteach ? "teacher" : "admin"} id:
                        </label>
                        <input type="text" maxLength={8} name="uid" placeholder="Enter user id here" onChange={(e) => { props.changeHandler(e, "uid") }} style={{ margin: "0" }} setValid={props.setvalidation} />
                    </SpanComp >
                    {props.isteach ? <SpanComp style={{ width: "50%" }}>
                        <label htmlFor="sub">
                            Provide sub id if teacher is assigned one:
                        </label>
                        <input type="number" name="sub" placeholder="Enter subject id here" onChange={(e) => { props.changeHandler(e, "subid") }} style={{ margin: "0" }} setValid={props.setvalidation} />
                    </SpanComp> : <></>}
                </PopupDiv>
                {props.isStud || props.isteach ? <PopupDiv >
                    <SpanComp style={{ width: "50%" }}>
                        <label htmlFor="std">
                            Provide standard:
                        </label>
                        <input type="number" name="std" placeholder="Enter standard to assign" onChange={(e) => { props.changeHandler(e, "grade") }} style={{ margin: "0" }} setValid={props.setvalidation} />
                    </SpanComp>
                    <SpanComp style={{ width: "50%" }}>
                        <label htmlFor="section">
                            Provide section:
                        </label>
                        <input type="text" maxLength={2} name="section" placeholder="Enter section to assign" onChange={(e) => { props.changeHandler(e, "section") }} style={{ margin: "0" }} setValid={props.setvalidation} />
                    </SpanComp>
                </PopupDiv> : <></>}
                <AcceptBtn ref={props.btnComp} type="submit">Submit</AcceptBtn>
                <ErrorSpan id="minmaxerror" ref={props.errComp}></ErrorSpan>
                <CloseBtn id="closeBtn" type="reset" onClick={(e) => { props.close(e) }}>X</CloseBtn>
            </SearchForm>
        </DetailsForm>
    )
}