import { Fragment, useEffect, useRef, useState } from "react"
import { GradeCalculator } from "../../../utils/gradeCalculator"
import { GrNoOrSubIdValidation } from "../../../utils/Validations"
import { FetchApi } from "../../../utils/FetchApi"
import { toast, ToastContainer } from "react-toastify"
import { ErrorToast, Toaster } from "../../../utils/Toaster"
import { ErrorSpan, SearchBoxSection, SearchForm, SearchOutputSection, SearchParamSection } from "../../studentComponents/SchoolRes"
import { ButtonContainer, CommentContent, CommentsContainer, CommentTeacher, DownloadHandler, InputContainer, StudentResultContainer, TeacherInputTabContainer } from "../StudentsTab"
import { FaCircleUser, FaRegCommentDots } from "react-icons/fa6"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp"
import { DownloadBtn, StyledButton } from "../../../styled-components/styledButton"
import { LabelValuePair } from "../../helperComponents/LabelValuePair"
import { PerformanceWindow, StudentInfo, StudentInfoSegment } from "../../studentComponents/Home"
import { ReactTableComponent } from "../../helperComponents/ResultTable"
import { FaFileDownload } from "react-icons/fa"
import { roleExtractor } from "../../../utils/RoleExtractor"

export const StudentDataComponent = () => {
    const errorComp = useRef(null)
    const performanceComponent = useRef(null)
    const [grNo, setGrNo] = useState(null)
    const [displayData, setDisplayData] = useState(null)
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

    const sumbitHandler = async (e, apiUrl) => {
        e.preventDefault()
        const errobj = { "grno": { "condition": false, "message": "invalid gr no" } }
        if (!GrNoOrSubIdValidation(grNo)) errobj.grno.condition = true

        if (errobj.grno.condition) {
            errorComp.current.innerText = errobj.grno.message
            errorComp.current.style.display = "block"
            return
        } else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = "none"
        }
        try {
            let res;
            res = await FetchApi(apiUrl + "?" + new URLSearchParams({ "studId": grNo }), "GET", {})
            Toaster(res, toast)
            if (res.output) {
                setDisplayData(res.output)
                return
            }
        } catch (err) {
            ErrorToast(err, toast)
        } finally {
            setGrNo(null)
            e.target.reset();
        }
    };
    const userrole = roleExtractor(window.location.pathname)
    const columnDef = [
        {
            header: 'Subject Id',
            accessorKey: 'subId',
        },
        {
            header: 'Subject Name',
            accessorKey: 'subjectName',
        },
        {
            header: 'Practical Marks',
            accessorKey: 'practicalMM',
        },
        {
            header: 'Theory Marks',
            accessorKey: 'theoryMM',
        },
        {
            header: 'Grade',
            accessorKey: 'grade',
        },
    ]

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { sumbitHandler(e, `http://localhost:8090/${userrole}/displayStud`) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <FaCircleUser style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" value={grNo || ''} name="grNo" required placeholder=" " onChange={(e) => { setGrNo(Number(e.target.value)) }} />
                                    <FloatingLabel>Provide Gr NO for student:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ButtonContainer>
                            <StyledButton type="submit">Submit</StyledButton>
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
                                    <LabelValuePair label={"Name:"} value={displayData.StudData.Name}></LabelValuePair>
                                    <LabelValuePair label={"Standard:"} value={displayData.StudData.Std}></LabelValuePair>
                                    <LabelValuePair label={"Password:"} value={displayData.StudData.Password}></LabelValuePair>
                                    <LabelValuePair label={"Section:"} value={displayData.StudData.Section}></LabelValuePair>
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
                                                                <h3>{element.tName}</h3>
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
                                        {typeof (displayData?.MarkInfo) !== 'string' && displayData?.MarkInfo !== null && displayData?.MarkInfo !== undefined && displayData?.MarkInfo?.length > 0 ?
                                            <ReactTableComponent data={displayData?.MarkInfo} heading={"Academic Performance"} columnDefinition={columnDef}></ReactTableComponent>
                                            : <>No entry of marks provided by any teacher</>}
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