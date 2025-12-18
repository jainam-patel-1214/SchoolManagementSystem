import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import { ErrorToast } from "../../utils/toasterCode";
import { fetchApi } from "../../utils/fetchApiCode";
import { LabelValuePair } from "../helperComponents/LabelValuePair";
import { roleExtractor } from "../../utils/roleExtractor";
import {
  AllComponentsContainer,
  ContentContainers,
  HeadingComponent,
  InfoBox,
  InfoBoxContainer,
  PageHeading,
  UnderlineComponent,
} from "../../styled-components/HelperStyledComponents";
import { GridLayers } from "../helperComponents/GridItem";
import { GeneralTableComponent } from "../helperComponents/GeneralTable";
export const TeacherHome = () => {
  const [displayData, setDisplayData] = useState({});
  const [displayReport, setDisplayReport] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const userrole = roleExtractor(window.location.pathname);
  useEffect(() => {
    const baseApi = `http://localhost:8090/${userrole}`;

    const load = async () => {
      try {
        setIsLoading(true);
        const [dataRes, reportRes] = await Promise.all([
          fetchApi(`${baseApi}/data`, "GET", {}),
          fetchApi(`${baseApi}/displayPerformance`, "GET", {}),
        ]);
        setDisplayData(dataRes.output);
        setDisplayReport(reportRes.output);
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
                <LabelValuePair
                  label={"Id:"}
                  value={displayData.Id}
                ></LabelValuePair>
              </InfoBox>
              <InfoBox>
                <LabelValuePair
                  label={"Name:"}
                  value={displayData.Name}
                ></LabelValuePair>
              </InfoBox>
              <InfoBox>
                <LabelValuePair
                  label={"Password:"}
                  value={displayData.Password}
                ></LabelValuePair>
              </InfoBox>
              <InfoBox>
                <LabelValuePair
                  label={"Total Students:"}
                  value={"data coming soon"}
                ></LabelValuePair>
              </InfoBox>
            </InfoBoxContainer>
            <ContentContainers
              elements={"multiple"}
              style={{ marginTop: "1rem" }}
            >
              <HeadingComponent position={"top"}>
                <PageHeading>Class & Subject information:</PageHeading>
              </HeadingComponent>
              <GridLayers>
                <LabelValuePair
                  width={"23%"}
                  infobox={true}
                  label={"Subject allocated Id:"}
                  value={displayData.SubId}
                ></LabelValuePair>
                <LabelValuePair
                  width={"23%"}
                  infobox={true}
                  label={"Class Allocated:"}
                  value={displayData.Std + displayData.Section}
                ></LabelValuePair>
                <LabelValuePair
                  width={"40%"}
                  infobox={true}
                  label={"Subject Name:"}
                  value={displayData.SubName}
                ></LabelValuePair>
              </GridLayers>
            </ContentContainers>
            <ContentContainers
              elements={"multiple"}
              style={{ marginTop: "1rem" }}
            >
              <HeadingComponent position={"top"}>
                <PageHeading>
                  Performance among peers
                  <UnderlineComponent />
                </PageHeading>
              </HeadingComponent>
              {Object.keys(displayReport).length > 0 ? (
                <GeneralTableComponent
                  marginTopRequired={"1rem"}
                  data={displayReport}
                  columnDefinition={columnDef}
                ></GeneralTableComponent>
              ) : (
                <div> No Performance Report available</div>
              )}
            </ContentContainers>
          </AllComponentsContainer>
        </div>
      )}
    </>
  );
};
