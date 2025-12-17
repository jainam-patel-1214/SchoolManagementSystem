import { useEffect, useState } from "react";
import { GrNoOrSubIdValidation } from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { toast, ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { InputContainer } from "../StudentsTab";
import { FaCircleUser } from "react-icons/fa6";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
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
import { GridItemComponent } from "../../helperComponents/GridItem";
import { MdTableRows, MdWindow } from "react-icons/md";
import styled from "styled-components";
import { createColumnHelper } from "@tanstack/react-table";
import { GeneralTableComponent } from "../../helperComponents/GeneralTable";
import { useNavigate } from "react-router-dom";
import { roleExtractor } from "../../../utils/roleExtractor";

export const DataContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  svg {
    font-size: x-large;
    padding: 5px;
    border-radius: 10px;
    background-color: #ddddddac;
    margin: 0 5px;
    cursor: pointer;
  }
`;

export const StudentDataComponent = () => {
  const [filterData, setFilterData] = useState(null);
  const [searchKey, setSearchKey] = useState("");
  const [originalData, setOriginalData] = useState(null);
  const userrole = roleExtractor(window.location.pathname);
  const [isTable, setIsTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(
        `http://localhost:8090/teacher/allStudents`,
        "GET",
        {}
      );
      if (res.output) {
        setOriginalData(res.output);
        setFilterData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteStudentHandler = async (apiUrl, grNo) => {
    try {
      if (!GrNoOrSubIdValidation(grNo)) {
        ErrorToast("invalid gr no");
        return;
      }
      let res;
      res = await fetchApi(apiUrl, "DELETE", { grNo: grNo });
      Toaster(res, toast);
      if (res.output) {
        fetchData();
      }
    } catch (err) {
      ErrorToast(err, toast);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  const navigate = useNavigate();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("grNo", {
      header: "Student ID",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("studentName", {
      header: "Name",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor("password", {
      header: "Password",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("grade", {
      header: "Grade",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("section", {
      header: "Section",
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
            onClick={() => navigate(`/app/teacher/editStudent/${v.grNo}`)}
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
              deleteStudentHandler(
                `http://localhost:8090/${userrole}/delStudent`,
                Number(v.grNo)
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
          Display students
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          List of all the students within the school |{" "}
          <a href="/app/teacher/addStudent" style={{ color: "#00c200" }}>
            {" "}
            Create a new student here
          </a>
        </p>
      </HeadingComponent>

      <ContentContainers elements={"single"} usage={"nongrid"}>
        <InputContainer>
          <FaCircleUser style={{ fontSize: "xx-large" }} />
          <InputWrapper>
            <FloatingInput
              type="text"
              value={searchKey || ""}
              name="searchQuery"
              required
              placeholder=" "
              onChange={(e) => setSearchKey(e.target.value)}
            />
            <FloatingLabel>Filter students by Gr NO or name:</FloatingLabel>
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
            <div>Fetching all students</div>
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
                  objectId={value.grNo}
                  password={value.password}
                  name={value.studentName}
                  grade={value.grade}
                  section={value.section}
                  delete={deleteStudentHandler}
                  credits={""}
                  isStudent={true}
                ></GridItemComponent>
              ))}
            </GridContainer>
          )}
        </ContentContainers>
      </DataContainer>
    </AllComponentsContainer>
  );
};
