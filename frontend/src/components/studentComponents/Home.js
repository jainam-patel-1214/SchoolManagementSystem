import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { toast, ToastContainer } from "react-toastify";
import { CommentContent, CommentsContainer, CommentTeacher, DownloadHandler } from "../teacherComponents/StudentsTab";
import { FaRegCommentDots } from "react-icons/fa6";
import getCookie from "../../utils/getCookie";
import { GradeCalculator } from "../../utils/gradeCalculator";
import { FaFileDownload } from "react-icons/fa";
import { DownloadBtn } from "../../styled-components/styledButton";
import { SearchOutputSection } from "./SchoolRes";
import { fetchApi } from "../../utils/fetchApi";
import { ErrorToast } from "../../utils/Toaster";
import { ReactTableComponent } from "../helperComponents/ResultTable";
import { LabelValuePair } from "../helperComponents/LabelValuePair";

export const StudentHomeSection = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;
    padding: 1rem;
`
export const StudentInfo = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    margin: .5rem;
`

export const StudentInfoSegment = styled.div`
    display: flex;
    flex-direction: row;
`

export const SubInfo = styled.table`
    width: 45%;
    height: fit-content;
    border: 1px solid black;
    th{
        border: 1px solid black;
    }
    td{
        border: 1px solid black;
    }
`
export const TableEntry = styled.td`
    text-align: center;
`
export const LabelValue = styled.div`
    display: flex;
    flex-direction: row;
    width: 100%;
`
export const PerformanceWindow = styled.div`
    display: flex;
    margin:10px;
    flex-direction: column;
    align-items: center;

`

export const StudentHomePage = () => {
    const [displayData, setDisplayData] = useState({})
    const [displayReport, setDisplayReport] = useState({})
    const [uName, setuName] = useState('')
    const performanceComponent = useRef(null)
    const [totalMsg, setTotalMsg] = useState("");
    const marksColumnDef = [
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
    const subjectColumnDef = [
        {
            header: 'Subject Id',
            accessorKey: 'Subid',
        },
        {
            header: 'Name',
            accessorKey: 'Subname',
        },
        {
            header: 'Credits',
            accessorKey: 'Credit',
        },
    ]
    useEffect(() => {
        const name = getCookie("username")
        setuName(name)
        const baseUrl = "http://localhost:8090/student"
        const fetchReport = async () => {
            try {
                const name = getCookie("username")

                setuName(name)
                const [report, data] = await Promise.all([
                    fetchApi(`${baseUrl}/report`, "GET", {}),
                    fetchApi(`${baseUrl}/data`, "GET", {})
                ]);
                setDisplayReport(report.output)
                setDisplayData(data.output)

                let sum = 0
                report.output?.MarkInfo?.forEach(e => {
                    sum += Number(e.practicalMM) + Number(e.theoryMM)
                })
                const res = GradeCalculator((sum * 100) / (100 * displayReport?.MarkInfo?.length))
                setTotalMsg(res)
            } catch (err) {
                console.log({ here: "catch" })
                ErrorToast(err, toast)
            }
        };
        fetchReport()
    }, []);

    return (
        <div>
            <StudentHomeSection>
                < ToastContainer />
                <StudentInfo>
                    <LabelValuePair label={"Name:"} value={uName}></LabelValuePair>
                    <LabelValuePair label={"Standard:"} value={displayData?.Std}></LabelValuePair>
                    <LabelValuePair label={"Password:"} value={displayData?.Password}></LabelValuePair>
                    <LabelValuePair label={"Section:"} value={displayData?.Section}></LabelValuePair>
                </StudentInfo>
                {(typeof (displayData?.SubList) !== 'string' && displayData.SubList?.length > 0 && displayData !== null && displayData !== undefined) ? <ReactTableComponent data={displayData?.SubList} columnDefinition={subjectColumnDef} heading={"Your Modules"}></ReactTableComponent> : <>No Subject Info Found</>}
            </StudentHomeSection>
            {displayReport !== undefined && displayReport !== null ? <SearchOutputSection>
                <PerformanceWindow ref={performanceComponent}>
                    <h2>Your Report Card</h2>
                    <div style={{ border: "1px solid black", width: "100%" }}>
                        <div style={{ border: "1px solid black", margin: "10px", padding: "1rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <h3>Faculty reviews</h3>
                            {displayReport.CommentInfo?.length > 0 ? <>
                                <CommentsContainer>
                                    {displayReport.CommentInfo?.map((element, index) => {
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
                        {(typeof (displayReport?.MarkInfo) !== 'string' && displayReport.MarkInfo?.length > 0 && displayReport !== null && displayReport !== undefined) ? <ReactTableComponent data={displayReport?.MarkInfo} columnDefinition={marksColumnDef} heading={"Academic Performance"}></ReactTableComponent> : <>No entry of marks scroed in exam by any teacher</>}
                    </div>
                </PerformanceWindow>
            </SearchOutputSection> : <></>}
            <div style={{ border: "1px solid #a9a9a9ff", display: "flex", flexDirection: "row", justifyContent: "space-between", margin: "1rem auto", alignItems: "center", width: "97%" }}>
                <p style={{ textAlign: "left", marginLeft: "3px" }}><strong><i>Result:&nbsp;</i></strong>{totalMsg}</p>
                <DownloadBtn onClick={(e) => { DownloadHandler(e, uName, performanceComponent.current.innerHTML) }}><FaFileDownload /> &nbsp;Download</DownloadBtn>
            </div>
        </div>
    )
}