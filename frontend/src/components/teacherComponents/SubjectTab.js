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
import { GradeValidation, GrNoOrSubIdValidation } from "../../utils/Validations"
import { NullStateObjGenerator, ObjValueChangeHandler, ResetState } from "../../utils/StateSetter"

export const TeacherInputTabContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin: .5rem;
    align-items: center;
`


const fetchData = async (e, data, setData, setDisplayData, apiUrl, methodtype, dataObj, todo, errorComp,loadingDisplay) => {
    e.preventDefault()
    const errarr = ["invalid sub id", "invalid grade. Allowed range is 1 - 12"]
    let flagarr = [false, false]
    if (!GradeValidation(data.substd)) flagarr[1] = true
    if (!GrNoOrSubIdValidation(dataObj?.subId)) flagarr[0] = true
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
        loadingDisplay(true)
        let res;
        if (methodtype === "GET") {
            res = await FetchApi(apiUrl+"?"+new URLSearchParams({ "std": data.substd }),methodtype,{})
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
        ErrorToast(err,toast)
    } finally {
        loadingDisplay(false)
        ResetState(data,setData)
        e.target.reset();
    }
};



export const SubTab = (props) => {
    const errorComp = useRef(null)
    const [data,setData] = useState(NullStateObjGenerator(["substd"]))
    const [displayData, setDisplayData] = useState(null)
    const [isLoading,setIsLoading] = useState(false)
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
                    <SearchForm onSubmit={(e) => { fetchData(e, data, setData, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/displaySub`, "GET", {}, "fetch data", errorComp,setIsLoading) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="substd" value={data.substd || ''} placeholder=" " onChange={(e) => { ObjValueChangeHandler(e,setData,'number') }} />
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
    const [data,setData] = useState(NullStateObjGenerator(["subid","subname","subcredit","substd"]))
    const [displayData, setDisplayData] = useState(null)

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, data, setData, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/updateSub`, 'PUT', { "subId": data.subid, "subName": data.subname, "credits": data.subcredit, "levelStd": data.substd }, "editSub", errorComp) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subid" value={data.subid || ''} required placeholder=" " maxLength={8} onChange={(e) => { ObjValueChangeHandler(e,setData,'number') }} />
                                    <FloatingLabel>Provide subject's SubId to be updated:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Only fill the fields you wish to update data:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{width:"35%"}}>
                                <LuBookA style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="subname" value={data.subname || ''} placeholder=" " maxLength={55} onChange={(e) => { ObjValueChangeHandler(e,setData,'string') }} />
                                    <FloatingLabel>Provide new name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{width:"35%"}}>
                                <IoIosRibbon style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subcredit" value={data.subcredit || ''} placeholder=" " onChange={(e) => { ObjValueChangeHandler(e,setData,'number') }} />
                                    <FloatingLabel>Provide new credits:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{width:"35%"}}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="substd" value={data.substd || ''} placeholder=" " onChange={(e) => { ObjValueChangeHandler(e,setData,'number') }} />
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
    const [data,setData] = useState(NullStateObjGenerator(["subid"]))
    const [displayData, setDisplayData] = useState(null)

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, data, setData, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/delSubject`, "DELETE", {"subId":data.subid}, "delSub", errorComp) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subid" value={data.subid || ''} placeholder=" " onChange={(e) => { ObjValueChangeHandler(e,setData,'number') }} />
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
    const [data,setData] = useState(NullStateObjGenerator(["subid","subname","subcredit","substd"]))
    const [displayData, setDisplayData] = useState(null)

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { fetchData(e, data, setData, setDisplayData, `http://localhost:8090/${props.roleOfPerson}/createSub`, 'POST', { "subId": data.subid, "subName": data.subname, "credits": data.subcredit, "levelStd": data.substd }, "addSub", errorComp) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaOrcid style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={data.subid || ''} name="subid" required placeholder=" " maxLength={8} onChange={(e) => { ObjValueChangeHandler(e,setData,'number') }} />
                                    <FloatingLabel>Provide SubId for new subject:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}><h3>Fill further mendatory details below:</h3></div>
                        <TeacherInputTabContainer>
                            <InputContainer style={{width:"35%"}}>
                                <LuBookA style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" name="subname" value={data.subname || ''} placeholder=" " maxLength={55} onChange={(e) => { ObjValueChangeHandler(e,setData,'string') }} />
                                    <FloatingLabel>Provide subject name:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{width:"35%"}}>
                                <IoIosRibbon style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="subcredit" value={data.subcredit || ''} placeholder=" " onChange={(e) => { ObjValueChangeHandler(e,setData,'number') }} />
                                    <FloatingLabel>Provide subject credits:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{width:"35%"}}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="substd" value={data.substd || ''} placeholder=" " onChange={(e) => { ObjValueChangeHandler(e,setData,'number') }} />
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
