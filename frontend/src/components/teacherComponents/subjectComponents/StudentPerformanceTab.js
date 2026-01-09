import { useNavigate } from "react-router-dom";
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
} from "../StudentsTab";
import { FaRegCommentDots } from "react-icons/fa6";
import { GeneralTableComponent } from "../../helperComponents/GeneralTable";
import { roleExtractor } from "../../../utils/roleExtractor";

export const StudentPerformancePage = () => {
  const navigate = useNavigate();
  const [displayData, setDisplayData] = useState({});
  const userrole = roleExtractor(window.location.pathname);
  const [isLoading, setIsLoading] = useState(false);
  const performanceComponent = useRef(null);
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
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <ButtonElement
          bgcol={"#9395ff"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
          onClick={() =>
            navigate(
              `/app/${userrole}/editMarks?subId=${row.original.subId}&grNo=${id}&tm=${row.original.theoryMM}&pm=${row.original.practicalMM}`
            )
          }
        >
          Edit marks
        </ButtonElement>
      ),
    },
  ];
  useEffect(() => {
    const url = `/${userrole}/studentreport/${id}`;
    const fetchReport = async () => {
      try {
        setIsLoading(true);
        const result = await fetchApi(url, "GET", {});
        setDisplayData(result.output);
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
                  {`${name}'s Academic Report`}
                  <UnderlineComponent />
                </PageHeading>
              </HeadingComponent>
              <HeadingComponent position={"bottom"}>
                <p className="subHeading">
                  Update academic performance for this student here |{" "}
                  <a
                    href={`/app/${userrole}/enterMarks?grNo=${id}`}
                    style={{ color: "#00c200" }}
                  >
                    {" "}
                    Enter new marks
                  </a>
                </p>
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
              Back to view students
            </ButtonElement>
          </ContentContainers>
        </AllComponentsContainer>
      )}
    </>
  );
};
