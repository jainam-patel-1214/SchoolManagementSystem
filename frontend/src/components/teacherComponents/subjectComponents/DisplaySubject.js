import { useState, useEffect, useMemo, useRef } from "react";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { ToastContainer } from "react-toastify";
import { InputContainer } from "../StudentsTab";
import { RiBookShelfLine } from "react-icons/ri";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { GrNoSubIdTeacherIdAdminIdValidation } from "../../../utils/validations";
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

export const DisplaySubTabComp = () => {
  const userrole = roleExtractor(window.location.pathname);
  const [isLoading, setIsLoading] = useState(false);
  const [searchKey, setSearchKey] = useState("");
  const [data, setData] = useState([]);
  const originalData = useRef([]);
  const [isTable, setIsTable] = useState(false);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(`/${userrole}/allSubjects`, "GET", {});
      if (res.output && typeof res.output !== "string") {
        originalData.current = res.output;
        setData(res.output);
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
      if (!GrNoSubIdTeacherIdAdminIdValidation(subjectId)) {
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
  const columns = useMemo(() => [
    {
      header: "Subject ID",
      accessorKey: "subjectId",
      id: "subjectId",
      enableSorting: false,
    },
    {
      header: "Subject Name",
      accessorKey: "subjectName",
      id: "subjectName",
      enableSorting: true,
    },
    {
      header: "Grade",
      accessorKey: "level",
      id: "level",
      enableSorting: false,
    },
    {
      header: "Credits",
      accessorKey: "credits",
      id: "credits",
      enableSorting: false,
    },
    {
      id: "accept",
      Header: "",
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
    },
    {
      id: "reject",
      Header: "",
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
                `/${userrole}/delSubject`,
                Number(v.subjectId)
              )
            }
          >
            Delete
          </ButtonElement>
        );
      },
    },
  ]);

  const handleFilterSubject = (e) => {
    const value = e.target.value;
    setSearchKey(value);
    if (!value) {
      setData(originalData.current);
      return;
    }
    const q = value.toLowerCase();
    const rr = originalData.current.filter(
      (e) =>
        e.subjectId.toString().includes(q) ||
        e.subjectName.toLowerCase().includes(q)
    );
    setData(rr);
  };
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
          {userrole === "admin" && (
            <>
              {" | "}
              <a
                href={`/app/${userrole}/setSubjectLimit`}
                style={{ color: "#8513ffff" }}
              >
                Set subject limit here
              </a>
            </>
          )}
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
              handleFilterSubject
              onChange={handleFilterSubject}
            />
            <FloatingLabel>
              Filter subjects by Subject ID or name:
            </FloatingLabel>
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
            <div>Fetching all subjects</div>
          ) : isTable ? (
            <GeneralTableComponent data={data} columnDefinition={columns} />
          ) : data.length > 0 ? (
            <GridContainer>
              {data.map(({ subjectId, subjectName, level, credits }, i) => (
                <GridItemComponent
                  key={subjectId} // ✅ better key
                  index={i}
                  objectId={subjectId}
                  password=""
                  name={subjectName}
                  grade={level}
                  section=""
                  credits={credits}
                  isStudent={false}
                  delete={deleteSubjectHandler}
                  variant="subject"
                />
              ))}
            </GridContainer>
          ) : null}
        </ContentContainers>
      </DataContainer>
    </AllComponentsContainer>
  );
};
