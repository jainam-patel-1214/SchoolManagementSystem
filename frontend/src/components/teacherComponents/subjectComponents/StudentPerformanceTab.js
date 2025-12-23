import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import { fetchApi, fetchUrlParams } from "../../../utils/fetchApiCode";
import { useEffect, useRef, useState } from "react";
import { ErrorToast } from "../../../utils/toasterCode";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  HeadingComponent,
  InfoBox,
  InfoBoxContainer,
  PageHeading,
  UnderlineComponent,
} from "../../../styled-components/HelperStyledComponents";
import { ToastContainer } from "react-toastify";
import { LabelValuePair } from "../../helperComponents/LabelValuePair";
import {
  CommentContent,
  CommentsContainer,
  CommentTeacher,
  DownloadHandler,
} from "../StudentsTab";
import { FaRegCommentDots } from "react-icons/fa6";
import { GeneralTableComponent } from "../../helperComponents/GeneralTable";
import { FaFileDownload } from "react-icons/fa";
import { GradeCalculator } from "../../../utils/gradeCalculator";
import { roleExtractor } from "../../../utils/roleExtractor";

const DownloadBtn = styled.button`
  padding: 10px 30px;
  cursor: pointer;
  vertical-align: middle;
  border: none;
  border-radius: 15px;
  margin-right: 15px;
  background-color: #2ad2008a;
  box-shadow: 10px 10px 20px #9d9d9d82;
  height: fit-content;
  transition: 0.3s ease-in-out;
  &:hover {
    background-color: #30f0008a;
  }
`;

export const StudentPerformancePage = () => {
  const navigate = useNavigate();
  const [displayData, setDisplayData] = useState({});
  const userrole = roleExtractor(window.location.pathname);
  const [isLoading, setIsLoading] = useState(false);
  const performanceComponent = useRef(null);
  const [totalMsg, setTotalMsg] = useState("");
  const id = fetchUrlParams("grNo");
  const name = fetchUrlParams("name");
  const standard = fetchUrlParams("std");
  const section = fetchUrlParams("section");
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
    const url = `http://localhost:8090/${userrole}/studentreport/${id}`;
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const result = await fetchApi(url, "GET", {});
        setDisplayData(result.output);
        let sum = 0;
        result.output?.MarkInfo?.forEach((e) => {
          sum += Number(e.practicalMM) + Number(e.theoryMM);
        });
        const res = GradeCalculator(
          (sum * 100) / (100 * result.output?.MarkInfo?.length)
        );
        setTotalMsg(res);
      } catch (err) {
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
              <LabelValuePair label={"Name:"} value={name} />
            </InfoBox>
            <InfoBox>
              <LabelValuePair label={"Standard:"} value={standard} />
            </InfoBox>
            <InfoBox>
              <LabelValuePair label={"Section:"} value={section} />
            </InfoBox>
          </InfoBoxContainer>
          {displayData !== undefined && displayData !== null ? (
            <div ref={performanceComponent}>
              <HeadingComponent position={"top"}>
                <PageHeading>
                  {`${name}'s Report Card`}
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
                {displayData.CommentInfo?.length > 0 ? (
                  <CommentsContainer>
                    {displayData.CommentInfo.map((element, index) => {
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
                {typeof displayData.MarkInfo !== "string" &&
                displayData.MarkInfo?.length > 0 &&
                displayData !== null &&
                displayData !== undefined ? (
                  <GeneralTableComponent
                    marginTopRequired={"1rem"}
                    data={displayData.MarkInfo}
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
                  name,
                  performanceComponent.current.innerHTML
                );
              }}
            >
              <FaFileDownload /> &nbsp;Download
            </DownloadBtn>
          </div>
          <ContentContainers
            elements={"multiple"}
            style={{ marginTop: "1rem" }}
          >
            <ButtonElement
              bgcol={"default"}
              border={"default"}
              textcol={"default"}
              hovercol={"default"}
              onClick={() => navigate(`/app/${userrole}/displayStudent`)}
            >
              Back to view teachers
            </ButtonElement>
          </ContentContainers>
        </AllComponentsContainer>
      )}
    </>
  );
};
