import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { roleExtractor } from "../../../utils/roleExtractor";
import { fetchApi, fetchUrlParams } from "../../../utils/fetchApiCode";
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
import { LabelValuePair } from "../../helperComponents/LabelValuePair";
import { GeneralTableComponent } from "../../helperComponents/GeneralTable";
import { useNavigate } from "react-router-dom";

export const TeacherPerformanceTab = () => {
  const navigate = useNavigate();
  const [displayData, setDisplayData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const userrole = roleExtractor(window.location.pathname);
  const id = fetchUrlParams("tid");
  const name = fetchUrlParams("name");
  const standard = fetchUrlParams("std");
  const section = fetchUrlParams("section");
  const subject = fetchUrlParams("subject");
  useEffect(() => {
    const url = `http://localhost:8090/${userrole}/displayTeacherPerformance/${id}`;
    const load = async () => {
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

    load();
  }, []);
  const columnDef = [
    {
      header: "Teacher Id",
      accessorKey: "Tid",
    },
    {
      header: "Teacher Name",
      accessorKey: "TName",
    },
    {
      header: "Standard Allocated",
      accessorKey: "StdAllocated",
    },
    {
      header: "Subject Allocated",
      accessorKey: "SubName",
    },
    {
      header: "Total Practical Marks",
      accessorKey: "TotalPracticalMarks",
    },
    {
      header: "Total Theory Marks",
      accessorKey: "TotalTheoryMarks",
    },
  ];

  return (
    <>
      {isLoading ? (
        <>Fetching the data</>
      ) : (
        <div>
          <AllComponentsContainer>
            <ToastContainer />
            <InfoBoxContainer>
              <InfoBox>
                <LabelValuePair label={"Id:"} value={id} />
              </InfoBox>
              <InfoBox>
                <LabelValuePair label={"Name:"} value={name} />
              </InfoBox>
              <InfoBox>
                <LabelValuePair
                  label={"Class appointed:"}
                  value={standard + section}
                />
              </InfoBox>
              <InfoBox>
                <LabelValuePair label={"Subject appointed:"} value={subject} />
              </InfoBox>
            </InfoBoxContainer>
            <ContentContainers
              elements={"multiple"}
              style={{ marginTop: "1rem" }}
            >
              <HeadingComponent position={"top"}>
                <PageHeading>
                  {`${name}'s Performance along with their peers`}
                  <UnderlineComponent />
                </PageHeading>
              </HeadingComponent>
              <HeadingComponent position={"bottom"}>
                <p className="subHeading">
                  <strong>Note:</strong> Total prcatical and theoritical marks
                  depicts total marks scored overall by all students
                  correspondingly
                </p>
              </HeadingComponent>
              {Object.keys(displayData).length > 0 ? (
                <GeneralTableComponent
                  marginTopRequired={"1rem"}
                  data={displayData}
                  columnDefinition={columnDef}
                ></GeneralTableComponent>
              ) : (
                <div> No Performance Report available</div>
              )}
            </ContentContainers>
            <ContentContainers
              elements={"multiple"}
              style={{ marginTop: "1rem" }}
            >
              <ButtonElement
                bgcol={"default"}
                border={"default"}
                textcol={"default"}
                hovercol={"default"}
                onClick={() => navigate("/app/admin/displayTeacher")}
              >
                Back to view teachers
              </ButtonElement>
            </ContentContainers>
          </AllComponentsContainer>
        </div>
      )}
    </>
  );
};
