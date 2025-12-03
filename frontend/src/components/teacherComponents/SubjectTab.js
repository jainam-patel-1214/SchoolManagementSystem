import styled from "styled-components"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../studentComponents/SchoolRes"
import {  toast, ToastContainer } from "react-toastify"
import { StyledButton } from "../../styled-components/styledButton"
import { SubInfo, TableEntry } from "../studentComponents/Home"
import { useRef, useState } from "react"
import { ButtonContainer, InputContainer } from "./StudentsTab"
import { RiBookShelfLine } from "react-icons/ri"
import { FaOrcid } from "react-icons/fa6";
import { LuBookA } from "react-icons/lu";
import { IoIosRibbon } from "react-icons/io";
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { TableHeader } from "../../styled-components/TableComponents"
import { FetchApi } from "../../utils/FetchApi"
import { ErrorToast, Toaster } from "../../utils/Toaster"

export const TeacherInputTabContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: .5rem;
    align-items: center;
`


const fetchData = async (e, grade, setGrade, setDisplayData, apiUrl, methodtype, dataObj, todo, errorComp, cleanup) => {
    e.preventDefault()
    const errarr = ["invalid sub id", "invalid grade. Allowed range is 1 - 12"]
    let flagarr = [false, false]
    if ((grade < 1 || grade > 12) && grade !== null && grade !== undefined) flagarr[1] = true
    if ((dataObj.subId < 0 || dataObj.subId > 99999999) && dataObj.subId !== undefined && dataObj.subId !== null) flagarr[0] = true
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
        if (methodtype === "GET") {
            res = await FetchApi(apiUrl+"?"+new URLSearchParams({ "std": grade }),methodtype,{})
        } else {
            let bodyObj = {}
            for (const [key, value] of Object.entries(dataObj)) {
                console.log(key, value);
                if (value !== null && value !== undefined) {
                    bodyObj[key] = value
                }
            }
            switch (todo) {
                case "addSub":
                    res = await FetchApi(apiUrl,methodtype,bodyObj)
                    break;
                case "editSub":
                    res = await FetchApi(apiUrl,methodtype,bodyObj)
                    break;
                case "delSub":
                    res = await FetchApi(apiUrl,methodtype,{ "subId": dataObj.subId })
                    break;
                default:
                    break;
            }
        }
        Toaster(res,toast)
        if (res.output) {
            setDisplayData(res.output)
            return
        }
    } catch (err) {
        ErrorToast(err.error,toast)
    } finally {
        cleanup.forEach(e => e(null))
        e.target.reset();
    }
};



export const SubTab = (props) => {
    const errorComp = useRef(null)
    
    const [grade, setGrade] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e) => {
        setGrade(Number(e.target.value))
    }
    const SuperScriptText = (num)=>{
        switch (num) {
            case 1:
                return "st";
            case 2:
                return "nd";
            case 3:
                return "rd";
            default:
                return "th";
        }
    }

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, grade, setGrade, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/displaySub`, "GET", {}, "fetch data", errorComp, [setGrade]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={grade || ''} placeholder=" " onChange={(e) => { changeHandler(e) }} />
                                    <FloatingLabel>Provide standard to search associated subjects :</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ButtonContainer>
                            <StyledButton  type="submit">Submit</StyledButton>
                        </ButtonContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
            {displayData!==undefined&&displayData!==null?<SearchOutputSection>
                {(typeof displayData === 'string' && displayData === "no subjects found") ? <>No Subjects Found</> : <>
                    {displayData?.length > 0 ? <div style={{ margin: "10px", padding: "1rem", display: "flex", justifyContent: "center", flexDirection: "column" }}>
                                        <h3 style={{ textAlign: "center",margin:"0",marginBottom:"1rem" }}>List of subject in {displayData[0].level} <sup>{SuperScriptText(Number(displayData[0].level))}</sup> standard</h3>
                    <SubInfo style={{ border: "1px solid #a9a9a9ff",margin:"auto" }}>
                        <thead>
                            <tr>
                                <TableHeader>Subject Id</TableHeader>
                                <TableHeader>Name</TableHeader>
                                <TableHeader>Standard</TableHeader>
                                <TableHeader>Credits</TableHeader>
                            </tr>
                        </thead>
                        <tbody>
                            {displayData?.map((element, index) => {
                                return (
                                    <tr key={index}>
                                        <TableEntry>{element.subjectId}</TableEntry>
                                        <TableEntry>{element.subjectName}</TableEntry>
                                        <TableEntry>{element.level}</TableEntry>
                                        <TableEntry>{element.credits}</TableEntry>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </SubInfo></div> : <></>}</>
                }
            </SearchOutputSection>:<></>}
        </div>
    )
}

export const SubEditTab = (props) => {
    const errorComp = useRef(null)
    
    const [grade, setGrade] = useState(null)
    const [credits, setCredits] = useState(null)
    const [subId, setsubId] = useState(null)
    const [name, setName] = useState(null)
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
                setGrade(Number(e.target.value))
                break;
            case "credits":
                setCredits(Number(e.target.value))
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
                    <SearchForm onSubmit={(e) => { fetchData(e, grade, setGrade, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/updateSub`, 'PUT', { "subId": subId, "subName": name, "credits": credits, "levelStd": grade }, "editSub", errorComp, [setGrade, setCredits, setName, setsubId]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subid" value={subId || ''} required placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "subid") }} />
                                    <FloatingLabel>Provide subject's SubId to be updated:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Only fill the fields you wish to update data:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{width:"35%"}}>
                                <LuBookA style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="subname" value={name || ''} placeholder=" " maxLength={55} onChange={(e) => { changeHandler(e, "name") }} />
                                    <FloatingLabel>Provide new name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{width:"35%"}}>
                                <IoIosRibbon style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="credit" value={credits || ''} placeholder=" " onChange={(e) => { changeHandler(e, "credits") }} />
                                    <FloatingLabel>Provide new credits:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{width:"35%"}}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={grade || ''} placeholder=" " onChange={(e) => { changeHandler(e, "std") }} />
                                    <FloatingLabel>Provide new standard:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton  type="submit">Submit</StyledButton>
                        </ButtonContainer>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
                {displayData!==undefined&&displayData!==null?<SearchOutputSection>
                    {typeof (displayData) === "string" ? <div style={{ padding: "10px" }}>{displayData}</div> : <></>}
                </SearchOutputSection>:<></>}
        </div>
    )
}

export const SubDelTab = (props) => {
    const errorComp = useRef(null)
    
    const [subid, setSubId] = useState(null)
    const [displayData, setDisplayData] = useState(null)
    const changeHandler = (e) => {
        setSubId(Number(e.target.value))
    }

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, undefined, setSubId, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/delSubject`, "DELETE", {"subId":subid}, "delSub", errorComp, [setSubId]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subid" value={subid || ''} placeholder=" " onChange={(e) => { changeHandler(e) }} />
                                    <FloatingLabel>Provide subId of subject you wish to delete:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                            <ButtonContainer>
                                <StyledButton  type="submit">Submit</StyledButton>
                            </ButtonContainer>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
                {displayData!==undefined&&displayData!==null?<SearchOutputSection>
                    {(typeof displayData === 'string') ? <div style={{ padding: "10px" }}>{displayData}</div> :
                        <></>
                    }
                </SearchOutputSection>:<></>}
        </div>
    )
}

export const SubAddTab = (props) => {
    const errorComp = useRef(null)
    
    const [grade, setGrade] = useState(null)
    const [credits, setCredits] = useState(null)
    const [subId, setsubId] = useState(null)
    const [name, setName] = useState(null)
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
                setGrade(Number(e.target.value))
                break;
            case "credits":
                setCredits(Number(e.target.value))
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
                    <SearchForm onSubmit={(e) => { fetchData(e, grade, setGrade, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/createSub`, 'POST', { "subId": subId, "subName": name, "credits": credits, "levelStd": grade }, "addSub", errorComp, [setGrade, setCredits, setName, setsubId]) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={subId || ''} name="subid" required placeholder=" " maxLength={8} onChange={(e) => { changeHandler(e, "subid") }} />
                                    <FloatingLabel>Provide SubId for new subject:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further mendatory details below:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{width:"35%"}}>
                                <LuBookA style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="subname" value={name || ''} placeholder=" " maxLength={55} onChange={(e) => { changeHandler(e, "name") }} />
                                    <FloatingLabel>Provide subject name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{width:"35%"}}>
                                <IoIosRibbon style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="credit" value={credits || ''} placeholder=" " onChange={(e) => { changeHandler(e, "credits") }} />
                                    <FloatingLabel>Provide subject credits:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{width:"35%"}}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={grade || ''} placeholder=" " onChange={(e) => { changeHandler(e, "std") }} />
                                    <FloatingLabel>Provide subject's grade:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton  type="submit">Submit</StyledButton>
                        </ButtonContainer>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
                {displayData!==undefined&&displayData!==null?<SearchOutputSection>
                    {typeof (displayData) === "string" ? <div style={{ padding: "10px" }}>{displayData}</div> : <></>}
                </SearchOutputSection>:<></>}
        </div>
    )
}
