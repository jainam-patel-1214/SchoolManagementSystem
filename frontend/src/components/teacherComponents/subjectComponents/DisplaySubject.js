import { useState, useEffect } from "react";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { toast, ToastContainer } from "react-toastify";
import { InputContainer } from "../StudentsTab";
import { RiBookShelfLine } from "react-icons/ri";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { GrNoOrSubIdValidation } from "../../../utils/validations";
import { roleExtractor } from "../../../utils/roleExtractor";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  DisplayViewFormatContainer,
  GridContainer,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../../styled-components/HelperStyledComponents";
import { LineBreak } from "../../../styled-components/LineBreak";
import { DataContainer } from "../studentComponents/GetStudentData";
import { MdTableRows, MdWindow } from "react-icons/md";
import { GeneralTableComponent } from "../../helperComponents/GeneralTable";
import { GridItemComponent } from "../../helperComponents/GridItem";
import { useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";

export const DisplaySubTabComp = () => {
  const userrole = roleExtractor(window.location.pathname);
  const [isLoading, setIsLoading] = useState(false);
  const [filterData, setFilterData] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const [isTable, setIsTable] = useState(false);
  // const SuperScriptText = (num) => {
  //   switch (num) {
  //     case 1:
  //       return "st";
  //     case 2:
  //       return "nd";
  //     case 3:
  //       return "rd";
  //     default:
  //       return "th";
  //   }
  // };
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(
        `http://localhost:8090/${userrole}/allSubjects`,
        "GET",
        {}
      );
      if (res.output) {
        setOriginalData(res.output);
        setFilterData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteSubjectHandler = async (apiUrl, subjectId) => {
    try {
      if (!GrNoOrSubIdValidation(subjectId)) {
        ErrorToast("invalid gr no");
        return;
      }
      let res;
      res = await fetchApi(apiUrl, "DELETE", { subId: subjectId });
      Toaster(res);
      if (res.output) {
        fetchData();
      }
    } catch (err) {
      ErrorToast(err);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const navigate = useNavigate();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("subjectId", {
      header: "Subject ID",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("subjectName", {
      header: "Name",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor("level", {
      header: "Grade",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("credits", {
      header: "Credits",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.display({
      id: "accept",
      header: "",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <ButtonElement
            style={{ width: "100%" }}
            bgcol={"transparent"}
            border={"1px solid #b5b5b5af"}
            textcol={"green"}
            hovercol={"#dcfff487"}
            onClick={() =>
              navigate(`/app/${userrole}/editSubject/${v.subjectId}`)
            }
          >
            Edit
          </ButtonElement>
        );
      },
    }),

    columnHelper.display({
      id: "reject",
      header: "",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <ButtonElement
            style={{ width: "100%" }}
            bgcol={"transparent"}
            border={"1px solid #b5b5b5af"}
            textcol={"red"}
            hovercol={"#ffd3d3af"}
            onClick={() =>
              deleteSubjectHandler(
                `http://localhost:8090/${userrole}/delSubject`,
                Number(v.subjectId)
              )
            }
          >
            Delete
          </ButtonElement>
        );
      },
    }),
  ];
  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Display subjects
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          List of all the subjects within the school |{" "}
          <a href={`/app/${userrole}/addSubject`} style={{ color: "#00c200" }}>
            {" "}
            Create a new subject here
          </a>
        </p>
      </HeadingComponent>

      <ContentContainers elements={"single"} usage={"nongrid"}>
        <InputContainer>
          <RiBookShelfLine style={{ fontSize: "xx-large" }} />
          <InputWrapper>
            <FloatingInput
              type="text"
              value={searchKey || ""}
              name="searchQuery"
              required
              placeholder=" "
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <FloatingLabel>
              Filter subjects by Subject ID or name:
            </FloatingLabel>
          </InputWrapper>
        </InputContainer>
        <ButtonElement
          bgcol={"default"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
        >
          Search
        </ButtonElement>
      </ContentContainers>

      <LineBreak />
      <DataContainer>
        <DisplayViewFormatContainer>
          <MdTableRows
            style={{ backgroundColor: isTable ? "#878787ac" : "#ddddddac" }}
            onClick={() => setIsTable(true)}
          />
          <MdWindow
            style={{ backgroundColor: !isTable ? "#878787ac" : "#ddddddac" }}
            onClick={() => setIsTable(false)}
          />
        </DisplayViewFormatContainer>
        <ContentContainers
          elements={"single"}
          usage={"nongrid"}
          style={{ padding: isTable ? "0" : "15px" }}
        >
          {isLoading ? (
            <div>Fetching all subjects</div>
          ) : isTable ? (
            <GeneralTableComponent
              data={filterData}
              columnDefinition={columns}
            ></GeneralTableComponent>
          ) : (
            <GridContainer>
              {filterData?.map((value, i) => (
                <GridItemComponent
                  key={i}
                  index={i}
                  objectId={value.subjectId}
                  password={""}
                  name={value.subjectName}
                  grade={value.level}
                  section={""}
                  credits={value.credits}
                  isStudent={false}
                  delete={deleteSubjectHandler}
                ></GridItemComponent>
              ))}
            </GridContainer>
          )}
        </ContentContainers>
      </DataContainer>
    </AllComponentsContainer>
  );
};
