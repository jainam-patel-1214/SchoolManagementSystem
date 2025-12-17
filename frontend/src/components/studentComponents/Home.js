import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { ToastContainer } from "react-toastify";
import {
  CommentContent,
  CommentsContainer,
  CommentTeacher,
  DownloadHandler,
} from "../teacherComponents/StudentsTab";
import { FaRegCommentDots } from "react-icons/fa6";
import getCookie from "../../utils/getCookie";
import { GradeCalculator } from "../../utils/gradeCalculator";
import { FaFileDownload } from "react-icons/fa";
import { DownloadBtn } from "../../styled-components/StyledButton";
import { fetchApi } from "../../utils/fetchApiCode";
import { ErrorToast } from "../../utils/toasterCode";
import { LabelValuePair } from "../helperComponents/LabelValuePair";
import {
  InfoBox,
  InfoBoxContainer,
  AllComponentsContainer,
  ContentContainers,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../styled-components/HelperStyledComponents";
import { GeneralTableComponent } from "../helperComponents/GeneralTable";

export const StudentHomeSection = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  margin: 1rem;
`;
export const StudentInfo = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin: 0.5rem;
`;

export const StudentInfoSegment = styled.div`
  display: flex;
  flex-direction: row;
`;

export const SubInfo = styled.table`
  width: 45%;
  height: fit-content;
  border: 1px solid black;
  th {
    border: 1px solid black;
  }
  td {
    border: 1px solid black;
  }
`;
export const TableEntry = styled.td`
  text-align: center;
`;

export const PerformanceWindow = styled.div`
  display: flex;
  margin: 10px;
  flex-direction: column;
  align-items: center;
`;

export const StudentHomePage = () => {
  const [displayData, setDisplayData] = useState({});
  const [displayReport, setDisplayReport] = useState({});
  const [userName, setUserName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const performanceComponent = useRef(null);
  const [totalMsg, setTotalMsg] = useState("");
  const marksColumnDef = [
    {
      header: "Subject Id",
      accessorKey: "subId",
    },
    {
      header: "Subject Name",
      accessorKey: "subjectName",
    },
    {
      header: "Practical Marks",
      accessorKey: "practicalMM",
    },
    {
      header: "Theory Marks",
      accessorKey: "theoryMM",
    },
    {
      header: "Grade",
      accessorKey: "grade",
    },
  ];
  const subjectColumnDef = [
    {
      header: "Subject Id",
      accessorKey: "Subid",
    },
    {
      header: "Name",
      accessorKey: "Subname",
    },
    {
      header: "Credits",
      accessorKey: "Credit",
    },
  ];
  useEffect(() => {
    const baseUrl = "http://localhost:8090/student";
    const fetchReport = async () => {
      try {
        const name = getCookie("username");
        if (name === "") {
          ErrorToast("cant find username due to invalid token");
        }
        setIsLoading(true);
        setUserName(name);
        const [report, data] = await Promise.all([
          fetchApi(`${baseUrl}/report`, "GET", {}),
          fetchApi(`${baseUrl}/data`, "GET", {}),
        ]);
        setDisplayReport(report.output);
        setDisplayData(data.output);

        let sum = 0;
        report.output?.MarkInfo?.forEach((e) => {
          sum += Number(e.practicalMM) + Number(e.theoryMM);
        });
        const res = GradeCalculator(
          (sum * 100) / (100 * report.output?.MarkInfo?.length)
        );
        setTotalMsg(res);
      } catch (err) {
        // console.log({ here: "catch" });
        ErrorToast(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchReport();
  }, []);

  return (
    <>
      {isLoading ? (
        <>Fetching the data</>
      ) : (
        <AllComponentsContainer>
          <ToastContainer />
          <InfoBoxContainer>
            <InfoBox>
              <LabelValuePair label={"Name:"} value={userName}></LabelValuePair>
            </InfoBox>
            <InfoBox>
              <LabelValuePair
                label={"Standard:"}
                value={displayData.Std}
              ></LabelValuePair>
            </InfoBox>
            <InfoBox>
              <LabelValuePair
                label={"Section:"}
                value={displayData.Section}
              ></LabelValuePair>
            </InfoBox>
            <InfoBox>
              <LabelValuePair
                label={"Password:"}
                value={displayData.Password}
              ></LabelValuePair>
            </InfoBox>
          </InfoBoxContainer>
          {typeof displayData.SubList !== "string" &&
          displayData.SubList?.length > 0 ? (
            <>
              <HeadingComponent position={"top"}>
                <PageHeading>
                  Your Modules
                  <UnderlineComponent />
                </PageHeading>
              </HeadingComponent>
              <ContentContainers
                elements={"multiple"}
                style={{ marginTop: "1rem" }}
              >
                <GeneralTableComponent
                  marginTopRequired={"1rem"}
                  data={displayData.SubList}
                  columnDefinition={subjectColumnDef}
                ></GeneralTableComponent>
              </ContentContainers>
            </>
          ) : (
            <>No Subject Info Found</>
          )}
          {displayReport !== undefined && displayReport !== null ? (
            <div>
              <HeadingComponent position={"top"}>
                <PageHeading>
                  Your Report Card
                  <UnderlineComponent />
                </PageHeading>
              </HeadingComponent>
              <ContentContainers
                elements={"multiple"}
                style={{ marginTop: "1rem" }}
              >
                <HeadingComponent position={"top"}>
                  <PageHeading>Faculty Reviews:</PageHeading>
                </HeadingComponent>
                {displayReport.CommentInfo?.length > 0 ? (
                  <CommentsContainer>
                    {displayReport.CommentInfo.map((element, index) => {
                      return (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            margin: "3px 0",
                          }}
                        >
                          <CommentTeacher>
                            <h3>Name: {element.tName}</h3>
                            <p>Teacher ID:{element.tId}</p>
                          </CommentTeacher>
                          <CommentContent>
                            <FaRegCommentDots />
                            <p>Review:&nbsp;{element.comment}</p>
                          </CommentContent>
                        </div>
                      );
                    })}
                  </CommentsContainer>
                ) : (
                  <>No review made by any teacher</>
                )}
              </ContentContainers>
              <ContentContainers
                elements={"multiple"}
                style={{ marginTop: "1rem" }}
              >
                <HeadingComponent position={"top"}>
                  <PageHeading>Performance Overview:</PageHeading>
                </HeadingComponent>
                {typeof displayReport.MarkInfo !== "string" &&
                displayReport.MarkInfo?.length > 0 &&
                displayReport !== null &&
                displayReport !== undefined ? (
                  <GeneralTableComponent
                    marginTopRequired={"1rem"}
                    data={displayReport.MarkInfo}
                    columnDefinition={marksColumnDef}
                  ></GeneralTableComponent>
                ) : (
                  <>No entry of marks scroed in exam by any teacher</>
                )}
              </ContentContainers>
            </div>
          ) : (
            <></>
          )}
          <div
            style={{
              border: "1px solid #a9a9a9ff",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              margin: "1rem auto",
              alignItems: "center",
              width: "97%",
            }}
          >
            <p style={{ textAlign: "left", marginLeft: "3px" }}>
              <strong>
                <i>Result:&nbsp;</i>
              </strong>
              {totalMsg}
            </p>
            <DownloadBtn
              onClick={(e) => {
                DownloadHandler(
                  e,
                  userName,
                  performanceComponent.current.innerHTML
                );
              }}
            >
              <FaFileDownload /> &nbsp;Download
            </DownloadBtn>
          </div>
        </AllComponentsContainer>
      )}
    </>
  );
};
