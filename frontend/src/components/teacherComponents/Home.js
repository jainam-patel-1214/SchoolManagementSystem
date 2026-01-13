import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
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
  const [studentsAmount, setStudentsAmount] = useState(0);
  const userrole = roleExtractor(window.location.pathname);
  const fetchStudents = async (a, b, c) => {
    const res = await fetchApi(
      "/teacher/selfStudents?" +
        new URLSearchParams({
          std: a,
          section: b,
          subId: c,
        }),
      "GET",
      {}
    );
    // if (res.output && typeof res !== "string") {
    setStudentsAmount(res.output);
    // }
  };
  useEffect(() => {
    const baseApi = `/${userrole}`;

    const load = async () => {
      try {
        setIsLoading(true);
        const [dataRes, reportRes] = await Promise.all([
          fetchApi(`${baseApi}/data`, "GET", {}),
          fetchApi(`${baseApi}/displayPerformance`, "GET", {}),
        ]);
        const { Std, Section, SubId } = dataRes.output;
        setDisplayData(
          typeof dataRes.output !== "string" ? dataRes.output : {}
        );
        fetchStudents(Std, Section, SubId);
        setDisplayReport(
          typeof reportRes.output !== "string" ? reportRes.output : []
        );
      } catch (err) {
        // ErrorToast(err);
        console.log(err);
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
      id: "teacherId",
    },
    {
      header: "Teacher Name",
      accessorKey: "TName",
      id: "teacherName",
    },
    {
      header: "Standard Allocated",
      accessorKey: "StdAllocated",
      id: "teacherStandard",
    },
    {
      header: "Subject Allocated",
      accessorKey: "SubName",
      id: "teacherSubject",
    },
    {
      header: "Total Practical Marks",
      accessorKey: "TotalPracticalMarks",
      id: "teacherTatalPracticalMM",
    },
    {
      header: "Total Theory Marks",
      accessorKey: "TotalTheoryMarks",
      id: "teacherTatalTheoryMM",
    },
  ];

  return (
    <>
      {isLoading ? (
        <>Fetching the data</>
      ) : (
        <div>
          <AllComponentsContainer className="parent-container">
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
                  value={studentsAmount}
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
                  value={displayData.SubId?.Int64 || "N/A"}
                ></LabelValuePair>
                <LabelValuePair
                  width={"23%"}
                  infobox={true}
                  label={"Class Allocated:"}
                  value={
                    displayData.Std?.Int64 === 0
                      ? "N/A"
                      : displayData.Std?.Int64.toString() +
                        displayData.Section?.String
                  }
                ></LabelValuePair>
                <LabelValuePair
                  width={"40%"}
                  infobox={true}
                  label={"Subject Name:"}
                  value={displayData.SubName?.String || "N/A"}
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
