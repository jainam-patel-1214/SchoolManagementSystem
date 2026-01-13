import { ToastContainer } from "react-toastify";
import styled from "styled-components";
import { useState } from "react";
import { TiSortAlphabetically } from "react-icons/ti";
import { RiBookShelfLine } from "react-icons/ri";
import { fetchApi } from "../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../utils/toasterCode";
import {
  GradeValidation,
  MarkValidation,
  StringValidator,
} from "../../utils/validations";
import { HiArrowTrendingUp, HiArrowTrendingDown } from "react-icons/hi2";
import { roleExtractor } from "../../utils/roleExtractor";
import { InputContainerComponent } from "../helperComponents/InputContainer";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  GridContainer,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../styled-components/HelperStyledComponents";
import { GridLayers } from "../helperComponents/GridItem";
import { GeneralTableComponent } from "../helperComponents/GeneralTable";

export const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  padding: 1rem;

  span input {
    margin: 15px;
    border: 1px solid grey;
    padding: 10px;
    border-radius: 5px;
  }

  span input::placeholder {
    color: #b5b5b5;
  }
`;

export const SchoolResult = () => {
  const userrole = roleExtractor(window.location.pathname);
  const columnDef = [
    {
      header: "Student Name",
      accessorKey: "studentName",
      id: "studentName",
    },
    {
      header: "Standard",
      accessorKey: "standard",
      id: "studentStd",
    },
    {
      header: "Section",
      accessorKey: "section",
      id: "studentSection",
    },
    {
      header: "Subject Name",
      accessorKey: "subject",
      id: "subjectName",
    },
    {
      header: "Practical Marks",
      accessorKey: "practicalMarks",
      id: "studentPracticalMarks",
    },
    {
      header: "Theory Marks",
      accessorKey: "theoryMarks",
      id: "studentTheoryMarks",
    },
    {
      header: "Grade",
      accessorKey: "grade",
      id: "marksGrade",
    },
  ];
  const initState = {
    section: "",
    grade: "",
    minMark: 0,
    maxMark: 100,
  };
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const [displayData, setDisplayData] = useState();
  const submitHandler = async (e) => {
    e.preventDefault();
    const errobj = {
      max: {
        condition: false,
        message: "Max mark not allowed more than 100 or less than 0",
      },
      min: {
        condition: false,
        message: "Min mark not allowed less than 0 or greater than 100",
      },
      section: { condition: false, message: "Invalid section" },
      std: {
        condition: false,
        message: "Grade/Std not allowed shall be between 1 and 12 inclusive",
      },
      minmaxcompare: {
        condition: false,
        message: "Min mark shall be less than max mark",
      },
    };

    if (!MarkValidation(Number(data.maxMark))) {
      ErrorToast(errobj.max.message);
      return;
    }
    if (!MarkValidation(Number(data.minMark))) {
      ErrorToast(errobj.min.condition);
      return;
    }
    if (data.grade !== "" && !GradeValidation(Number(data.grade))) {
      ErrorToast(errobj.std.message);
      return;
    }
    if (
      data.minMark != null &&
      data.maxMark != null &&
      Number(data.maxMark) <= Number(data.minMark)
    ) {
      ErrorToast(errobj.minmaxcompare.message);
      return;
    }
    if (!StringValidator(data.section)) {
      ErrorToast(errobj.section.message);
      return;
    }

    try {
      console.log(data, "filter data ehre");

      const apiUrl = `/${userrole}/display`;
      const params = {
        viewByStd: Number(data.grade),
        viewBySection: data.section,
        minPercent: Number(data.minMark),
        maxPercent: Number(data.maxMark),
      };
      const queryParams = {};
      let elem;
      for (elem of Object.keys(params)) {
        console.log(elem, params[elem], typeof params[elem]);

        if (
          params[elem] !== null &&
          params[elem] !== undefined &&
          typeof params[elem] !== "string" &&
          !isNaN(params[elem])
        ) {
          queryParams[elem] = params[elem];
        } else {
          if (StringValidator(params[elem])) queryParams[elem] = params[elem];
        }
      }

      const res = await fetchApi(
        apiUrl + "?" + new URLSearchParams(queryParams),
        "GET",
        {}
      );
      Toaster(res);
      if (res.output && typeof res.output !== "string") {
        setDisplayData(res.output);
      } else {
        setDisplayData(res.error);
      }
    } catch (err) {
      ErrorToast(err);
    }
  };

  return (
    <AllComponentsContainer className="parent-container">
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          School Result
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Fetch filtered result of school according to your choice |{" "}
          <a href={`/app/${userrole}`} style={{ color: "#008cffff" }}>
            {" "}
            Your Profile
          </a>
        </p>
      </HeadingComponent>
      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <HeadingComponent position={"top"}>
          <PageHeading>
            Fill in the columns by which you wish to filter school's result:
          </PageHeading>
        </HeadingComponent>
        <GridContainer>
          <InputContainerComponent
            width={"auto"}
            icon={RiBookShelfLine}
            handler={dataChangeHandler}
            objKey={"grade"}
            labelText={"Provide grade of class you wish result of:"}
            name={"std"}
            value={data.grade}
          ></InputContainerComponent>
          <InputContainerComponent
            width={"auto"}
            icon={TiSortAlphabetically}
            handler={dataChangeHandler}
            objKey={"section"}
            labelText={"Provide section of class you wish to filter:"}
            name={"section"}
            value={data.section}
          ></InputContainerComponent>
          <InputContainerComponent
            width={"auto"}
            icon={HiArrowTrendingDown}
            handler={dataChangeHandler}
            objKey={"minMark"}
            labelText={"Min marks:"}
            name={"minPercent"}
            value={data.minMark || ""}
          ></InputContainerComponent>
          <InputContainerComponent
            width={"auto"}
            handler={dataChangeHandler}
            icon={HiArrowTrendingUp}
            objKey={"maxMark"}
            labelText={"Max marks:"}
            name={"maxPercent"}
            value={data.maxMark || ""}
          ></InputContainerComponent>
        </GridContainer>
        <GridLayers style={{ width: "100%" }}>
          <ButtonElement
            style={{ width: "50%" }}
            bgcol={"default"}
            border={"default"}
            textcol={"default"}
            hovercol={"default"}
            type="submit"
            id="fetchResultButton"
            onClick={(e) => submitHandler(e)}
          >
            Search result
          </ButtonElement>
          <ButtonElement
            style={{ width: "48%" }}
            bgcol={"transparent"}
            border={"1px solid #b5b5b5af"}
            textcol={"red"}
            hovercol={"#ffd3d3af"}
            type="reset"
            onClick={() => setData(initState)}
          >
            Reset Filters
          </ButtonElement>
        </GridLayers>
      </ContentContainers>
      {typeof displayData !== "string" &&
      displayData !== null &&
      displayData !== undefined ? (
        <ContentContainers>
          <HeadingComponent position={"top"}>
            <PageHeading>Filter result as per your request:</PageHeading>
          </HeadingComponent>
          <GeneralTableComponent
            marginTopRequired={"1rem"}
            data={displayData}
            columnDefinition={columnDef}
          ></GeneralTableComponent>
        </ContentContainers>
      ) : (
        <></>
      )}
    </AllComponentsContainer>
  );
};
