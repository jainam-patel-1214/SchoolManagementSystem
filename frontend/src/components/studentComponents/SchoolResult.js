import { ToastContainer, toast } from "react-toastify";
import styled from "styled-components";
import { useState, useRef } from "react";
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

export const SearchBoxSection = styled.div`
  display: flex;
  flex-direction: column;
  width: 90%;
  margin: auto;
  margin-top: 2rem;
  padding: 5px 20px;
  background-color: #e9f8ffff;
  border-radius: 50px;
  border: 1px dotted blue;
`;
export const SearchParamSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;
export const SearchOutputSection = styled.div`
  margin: 1rem auto;
  display: flex;
  flex-direction: column;
  width: 90%;
  padding: 25px 20px;
  background-color: #c8ffde95;
  border-radius: 50px;
  border: 2px solid #8fb352;
`;
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
    /* padding: 5px; */
  }
`;
export const ErrorSpan = styled.div`
  color: red;
  background-color: #ffbbbb;
  width: fit-content;
  padding: 10px;
  margin-left: 1rem;
  display: none;
`;

export const SchoolResult = () => {
  const userrole = roleExtractor(window.location.pathname);
  const errorComp = useRef(null);
  const columnDef = [
    {
      header: "Student Name",
      accessorKey: "studentName",
    },
    {
      header: "Standard",
      accessorKey: "standard",
    },
    {
      header: "Section",
      accessorKey: "section",
    },
    {
      header: "Subject Name",
      accessorKey: "subject",
    },
    {
      header: "Practical Marks",
      accessorKey: "practicalMarks",
    },
    {
      header: "Theory Marks",
      accessorKey: "theoryMarks",
    },
    {
      header: "Grade",
      accessorKey: "grade",
    },
  ];
  const initState = {
    section: "",
    grade: "",
    minMark: null,
    maxMark: null,
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
    if (!GradeValidation(Number(data.grade))) {
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
      const apiUrl = `http://localhost:8090/${userrole}/display`;
      const params = {
        viewByStd: Number(data.grade),
        viewBySection: data.section,
        minPercent: Number(data.minMark),
        maxPercent: Number(data.maxMark),
      };
      const queryParams = {};
      let elem;
      for (elem of Object.keys(params)) {
        if (
          params[elem] !== null &&
          params[elem] !== undefined &&
          params[elem] !== NaN
        ) {
          queryParams[elem] = params[elem];
        }
      }
      const res = await fetchApi(
        apiUrl + "?" + new URLSearchParams(queryParams),
        "GET",
        {}
      );
      Toaster(res);
      if (res.output) {
        setDisplayData(res.output);
      } else {
        setDisplayData(res.error);
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setInitialData();
    }
  };

  const setInitialData = () => {
    setData(initState);
  };

  return (
    <AllComponentsContainer>
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
            isRequired={true}
            handler={dataChangeHandler}
            objKey={"grade"}
            labelText={"Provide grade of class you wish result of:"}
            name={"std"}
            value={data.grade}
          ></InputContainerComponent>
          <InputContainerComponent
            width={"auto"}
            isRequired={false}
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
            isRequired={false}
            labelText={"Min marks:"}
            name={"minPercent"}
            value={data.minMark}
          ></InputContainerComponent>
          <InputContainerComponent
            width={"auto"}
            handler={dataChangeHandler}
            icon={HiArrowTrendingUp}
            objKey={"maxMark"}
            isRequired={false}
            labelText={"Max marks:"}
            name={"maxPercent"}
            value={data.maxMark}
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
            onClick={() => setInitialData()}
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
    // <div>
    //   <PageHeading>School result:</PageHeading>
    //   <SearchBoxSection>
    //     <ToastContainer />
    //     <SearchParamSection>
    //       <div>
    //         <SearchForm action="" onSubmit={(e) => submitHandler(e)}>
    //           <TeacherInputTabContainer>
    //             <InputContainerComponent
    //               width={"50%"}
    //               icon={RiBookShelfLine}
    //               isRequired={true}
    //               handler={dataChangeHandler}
    //               objKey={"grade"}
    //               labelText={"Provide grade of class you wish result of:"}
    //               name={"std"}
    //               value={data.grade}
    //             ></InputContainerComponent>
    //             <InputContainerComponent
    //               width={"50%"}
    //               isRequired={false}
    //               icon={TiSortAlphabetically}
    //               handler={dataChangeHandler}
    //               objKey={"section"}
    //               labelText={"Provide section of class you wish to filter:"}
    //               name={"section"}
    //               value={data.section}
    //             ></InputContainerComponent>
    //           </TeacherInputTabContainer>
    //           <TeacherInputTabContainer>
    //             <label>Enter a range of marks you wish to filter : </label>
    //             <InputContainerComponent
    //               width={"50%"}
    //               icon={PiLineSegmentsBold}
    //               handler={dataChangeHandler}
    //               objKey={"minMark"}
    //               isRequired={false}
    //               labelText={"Min marks:"}
    //               name={"minPercent"}
    //               value={data.minMark}
    //             ></InputContainerComponent>
    //             <InputContainerComponent
    //               width={"50%"}
    //               handler={dataChangeHandler}
    //               objKey={"maxMark"}
    //               isRequired={false}
    //               labelText={"Max marks:"}
    //               name={"maxPercent"}
    //               value={data.maxMark}
    //             ></InputContainerComponent>
    //           </TeacherInputTabContainer>
    //           <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
    //           <ButtonContainer>
    //             <StyledButton type="submit">Submit</StyledButton>
    //           </ButtonContainer>
    //         </SearchForm>
    //       </div>
    //     </SearchParamSection>
    //   </SearchBoxSection>
    //   {typeof displayData !== "string" &&
    //   displayData !== null &&
    //   displayData !== undefined ? (
    //     <ReactTableComponent
    //       data={displayData}
    //       columnDefinition={columnDef}
    //       heading={"List of students for requested filter"}
    //     ></ReactTableComponent>
    //   ) : (
    //     <>
    //       {typeof displayData === "string" ? (
    //         <SearchOutputSection
    //           style={{ background: "#fa6c61", padding: "5px" }}
    //         >
    //           {displayData}
    //         </SearchOutputSection>
    //       ) : (
    //         <></>
    //       )}{" "}
    //     </>
    //   )}
    // </div>
  );
};
