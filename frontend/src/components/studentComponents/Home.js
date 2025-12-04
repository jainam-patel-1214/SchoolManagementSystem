import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { toast, ToastContainer } from "react-toastify";
import { CommentContent, CommentsContainer, CommentTeacher, DownloadHandler, StudentResultContainer } from "../teacherComponents/StudentsTab";
import { FaRegCommentDots } from "react-icons/fa6";
import { TableHeader } from "../../styled-components/TableComponents";
import getCookie from "../../utils/getCookie";
import { GradeCalculator } from "../../utils/gradeCalculator";
import { FaFileDownload } from "react-icons/fa";
import { DownloadBtn } from "../../styled-components/styledButton";
import { SearchOutputSection } from "./SchoolRes";
import { FetchApi } from "../../utils/FetchApi";
import { ErrorToast } from "../../utils/Toaster";

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
export const Label = styled.p`
    /* width: 50%; */
`
export const Value = styled.p`
    /* width: 50%; */
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

    useEffect(() => {
        const name = getCookie("username")
        setuName(name)
        const baseUrl = "http://localhost:8090/student"
        const fetchReport = async () => {
            try {
                const name = getCookie("username")
                console.log(name);
                
                setuName(name)
                const [report, data] = await Promise.all([
                    FetchApi(`${baseUrl}/report`, "GET", {}),
                    FetchApi(`${baseUrl}/data`, "GET", {})
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
                console.log({ here : "catch"})
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
                    <LabelValue>
                        <Label><strong>Name:&nbsp;</strong></Label>
                        <Value>{uName}</Value>
                    </LabelValue>
                    <LabelValue>
                        <Label><strong>Standard:&nbsp;</strong></Label>
                        <Value>{displayData.Std}</Value>
                    </LabelValue>
                    <LabelValue>
                        <Label><strong>Password:&nbsp;</strong></Label>
                        <Value>{displayData.Password}</Value>
                    </LabelValue>
                    <LabelValue>
                        <Label><strong>Section:&nbsp;</strong></Label>
                        <Value>{displayData.Section}</Value>
                    </LabelValue>
                </StudentInfo>
                {displayData.SubList?.length > 0 ? <SubInfo>
                    <thead>
                        <tr>
                            <th>Subject Id</th>
                            <th>Name</th>
                            <th>Credits</th>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData.SubList?.map((element, index) => {
                            return (
                                <tr key={index}>
                                    <TableEntry>{element.Subid}</TableEntry>
                                    <TableEntry>{element.Subname}</TableEntry>
                                    <TableEntry>{element.Credit}</TableEntry>
                                </tr>
                            )
                        })}
                    </tbody>
                </SubInfo> : <>No Subject Info Found</>}
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
                            {displayReport.MarkInfo?.length > 0 ? <>
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
                                        {displayReport.MarkInfo?.map((element, index) => {
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
            </SearchOutputSection> : <></>}
            <div style={{ border: "1px solid #a9a9a9ff", display: "flex", flexDirection: "row", justifyContent: "space-between", margin: "1rem auto", alignItems: "center", width: "97%" }}>
                <p style={{ textAlign: "left", marginLeft: "3px" }}><strong><i>Result:&nbsp;</i></strong>{totalMsg}</p>
                <DownloadBtn onClick={(e) => { DownloadHandler(e, uName, performanceComponent.current.innerHTML) }}><FaFileDownload /> &nbsp;Download</DownloadBtn>
            </div>
        </div>
    )
}