import { ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { GrNoSubIdTeacherIdAdminIdValidation } from "../../../utils/validations";
import { useEffect, useRef, useState } from "react";
import { InputContainer } from "../../teacherComponents/StudentsTab";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { fetchApi } from "../../../utils/fetchApiCode";
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
import { useNavigate } from "react-router-dom";
import { createColumnHelper } from "@tanstack/react-table";
import { FaCircleUser } from "react-icons/fa6";
import { LineBreak } from "../../../styled-components/LineBreak";
import { DataContainer } from "../../teacherComponents/studentComponents/GetStudentData";
import { MdTableRows, MdWindow } from "react-icons/md";
import { GeneralTableComponent } from "../../helperComponents/GeneralTable";
import { GridItemComponent } from "../../helperComponents/GridItem";
import { debouncedFilterData } from "../../../utils/filterData";

export const DisplayTeacherComponent = () => {
  const userrole = roleExtractor(window.location.pathname);
  const [searchKey, setSearchKey] = useState("");
  const [filterData, setFilterData] = useState(null);
  const originalData = useRef([]);
  const [isTable, setIsTable] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(
        `http://localhost:8090/${userrole}/allTeachers`,
        "GET",
        {}
      );
      if (res.output) {
        const output = [];
        res.output.forEach((e) => {
          const data = {};
          for (const [key, value] of Object.entries(e)) {
            if (typeof value === "object") {
              if (key === "gradeAllocated" || key === "subjectId") {
                data[key] = value.Int64 !== 0 ? value.Int64 : "";
              } else {
                data[key] = value.String;
              }
            } else {
              data[key] = value;
            }
          }
          output.push(data);
        });
        originalData.current = output;
        setFilterData(output);
        return;
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteTeacherHandler = async (apiUrl, teacherId) => {
    try {
      if (!GrNoSubIdTeacherIdAdminIdValidation(teacherId)) {
        ErrorToast("invalid teacher's id");
        return;
      }
      let res;
      res = await fetchApi(apiUrl, "DELETE", { teacherId: teacherId });
      Toaster(res);
      if (res.output) {
        fetchData();
      }
    } catch (err) {
      ErrorToast(err);
    }
  };

  const navigate = useNavigate();
  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("teacherId", {
      header: "Teacher ID",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("teacherName", {
      header: "Name",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),
    columnHelper.accessor("teacherPwd", {
      header: "Password",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("gradeAllocated", {
      header: "Grade allocated",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("sectionAllocated", {
      header: "Section Allocated",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.accessor("subjectAllocated", {
      header: "Subject Allocated",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),
    columnHelper.display({
      id: "edit",
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
              navigate(`/app/${userrole}/editTeacher/${v.teacherId}`)
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
              deleteTeacherHandler(
                `http://localhost:8090/${userrole}/delTeacher`,
                Number(v.teacherId)
              )
            }
          >
            Delete
          </ButtonElement>
        );
      },
    }),
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const handleFilterTeacher = (e) => {
    const value = e.target.value;
    setSearchKey(value);
    if (!value) {
      setFilterData(originalData.current);
      return;
    }
    const q = value.toLowerCase();
    const rr = originalData.current.filter(
      (e) =>
        e.teacherId.toString().includes(q) ||
        e.teacherName.toLowerCase().includes(q)
    );
    setFilterData(rr);
  };

  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Display Teachers
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          List of all the teachers within the school |{" "}
          <a href={`/app/${userrole}/addTeacher`} style={{ color: "#00c200" }}>
            {" "}
            Create a new teacher here
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
              onChange={(e) => handleFilterTeacher(e)}
            />
            <FloatingLabel>Filter teachers by ID or name:</FloatingLabel>
          </InputWrapper>
        </InputContainer>
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
            <div>Fetching all teachers</div>
          ) : isTable ? (
            <GeneralTableComponent
              data={filterData}
              columnDefinition={columns}
            ></GeneralTableComponent>
          ) : (
            <GridContainer>
              {filterData?.map(
                (
                  {
                    teacherId,
                    teacherPwd,
                    teacherName,
                    gradeAllocated,
                    sectionAllocated,
                    subjectAllocated,
                  },
                  i
                ) => (
                  <GridItemComponent
                    key={i}
                    index={i}
                    objectId={teacherId}
                    password={teacherPwd}
                    name={teacherName}
                    grade={
                      gradeAllocated !== 0 && gradeAllocated !== ""
                        ? gradeAllocated
                        : "N/"
                    }
                    section={sectionAllocated !== "" ? sectionAllocated : "A"}
                    delete={deleteTeacherHandler}
                    credits={""}
                    isStudent={false}
                    isTeacher={true}
                    subjectName={
                      subjectAllocated !== "" ? subjectAllocated : "N/A"
                    }
                  ></GridItemComponent>
                )
              )}
            </GridContainer>
          )}
        </ContentContainers>
      </DataContainer>
    </AllComponentsContainer>
  );
};
