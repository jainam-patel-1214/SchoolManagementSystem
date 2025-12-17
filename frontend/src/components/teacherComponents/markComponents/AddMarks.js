import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaCircleUser, FaOrcid } from "react-icons/fa6";
import { PiExamFill, PiExamLight } from "react-icons/pi";
import {
  GrNoOrSubIdValidation,
  PracticalMarksValidation,
  TheoryMarksValidation,
} from "../../../utils/validations";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { fetchApi } from "../../../utils/fetchApiCode";
import { roleExtractor } from "../../../utils/roleExtractor";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  GridContainer,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../../styled-components/HelperStyledComponents";
import { InputContainerComponent } from "../../helperComponents/InputContainer";
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridLayers } from "../../helperComponents/GridItem";

export const AddMarkTab = () => {
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    grNo: "",
    subId: "",
    theoryMarks: null,
    practicalMarks: null,
  };
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (
      data.grNo === "" ||
      data.practicalMarks === "" ||
      data.theoryMarks === "" ||
      data.subId === "" ||
      data.theoryMarks === null ||
      data.practicalMarks === null
    ) {
      ErrorToast("Please fill all the values above");
      return;
    }
    const errobj = {
      grno: { condition: false, message: "invalid gr no" },
      subid: { condition: false, message: "invalid sub id" },
      theory: {
        condition: false,
        message: "theory marks range shall be from 0 to 80",
      },
      practical: {
        condition: false,
        message: "practical marks range shall be from 0 to 20",
      },
    };
    if (!TheoryMarksValidation(data.theoryMarks)) {
      ErrorToast(errobj.theory.message);
      return;
    }
    if (!PracticalMarksValidation(data.practicalMarks)) {
      ErrorToast(errobj.practical.message);
      return;
    }
    if (!GrNoOrSubIdValidation(data.grNo)) {
      ErrorToast(errobj.grno.message);
      return;
    }
    if (!GrNoOrSubIdValidation(data.subId)) {
      ErrorToast(errobj.subid.message);
      return;
    }
    try {
      let res;
      const payload = {
        grNo: Number(data.grNo),
        subId: Number(data.subId),
        theoryMarks: Number(data.theoryMarks),
        practicalMarks: Number(data.practicalMarks),
      };
      let bodyObj = {};
      for (const [key, value] of Object.entries(payload)) {
        if (value !== null && value !== undefined && value !== NaN) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "POST", bodyObj);
      Toaster(res, toast);
    } catch (err) {
      ErrorToast(err, toast);
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
          Enter new marks record
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Add academic performance record for students |{" "}
          <a href="/app/teacher/displayStudent" style={{ color: "#008cffff" }}>
            {" "}
            View particular student's performance
          </a>{" "}
          |{" "}
          <a href="/app/teacher/editMarks" style={{ color: "#00c200" }}>
            {" "}
            Update student marks record here
          </a>
        </p>
      </HeadingComponent>

      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <HeadingComponent position={"top"}>
          <PageHeading>Student & Subject information:</PageHeading>
        </HeadingComponent>
        <GridContainer>
          <InputContainerComponent
            value={data.grNo}
            objKey={"grNo"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"grNo"}
            icon={FaCircleUser}
            labelText={"Provide sudent's ID:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.subId}
            objKey={"subId"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"subId"}
            icon={FaOrcid}
            labelText={"Provide subject's ID:"}
          ></InputContainerComponent>
        </GridContainer>
      </ContentContainers>

      <LineBreak />

      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <HeadingComponent position={"top"}>
          <PageHeading>Student score details:</PageHeading>
        </HeadingComponent>
        <GridContainer>
          <InputContainerComponent
            value={data.theoryMarks}
            objKey={"theoryMarks"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"theory"}
            icon={PiExamFill}
            labelText={"Enter theory marks (out of 80):"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.practicalMarks}
            objKey={"practicalMarks"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"practical"}
            icon={PiExamLight}
            labelText={"Enter practical marks (out of 20):"}
          ></InputContainerComponent>
        </GridContainer>
      </ContentContainers>
      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <GridLayers style={{ width: "100%" }}>
          <ButtonElement
            style={{ width: "50%" }}
            bgcol={"default"}
            border={"default"}
            textcol={"default"}
            hovercol={"default"}
            type="submit"
            onClick={(e) =>
              submitHandler(e, `http://localhost:8090/${userrole}/enterMarks`)
            }
          >
            Submit Marks
          </ButtonElement>
          <GridLayers style={{ width: "48%", margin: "0" }}>
            <ButtonElement
              style={{ width: "100%" }}
              bgcol={"transparent"}
              border={"1px solid #b5b5b5af"}
              textcol={"red"}
              hovercol={"#ffd3d3af"}
              type="reset"
              onClick={() => setInitialData()}
            >
              Reset
            </ButtonElement>
          </GridLayers>
        </GridLayers>
      </ContentContainers>
    </AllComponentsContainer>
    // <div>
    //   <PageHeading>Enter new marks record for student:</PageHeading>
    //   <SearchBoxSection>
    //     <ToastContainer />
    //     <SearchParamSection>
    //       <SearchForm
    //         onSubmit={(e) => {
    //           submitHandler(e, `http://localhost:8090/${userrole}/enterMarks`);
    //         }}
    //       >
    //         <TeacherInputTabContainer>
    //           <InputContainer style={{ width: "50%" }}>
    //             <FaCircleUser style={{ fontSize: "xx-large" }} />
    //             <InputWrapper>
    //               <FloatingInput
    //                 type="number"
    //                 value={data.grNo || ""}
    //                 required
    //                 name="grno"
    //                 placeholder=" "
    //                 maxLength={8}
    //                 onChange={(e) => {
    //                   dataChangeHandler("grNo", Number(e.target.value));
    //                 }}
    //               />
    //               <FloatingLabel>Provide Gr NO for student:</FloatingLabel>
    //             </InputWrapper>
    //           </InputContainer>
    //           <InputContainer style={{ width: "50%" }}>
    //             <FaOrcid style={{ fontSize: "xx-large" }} />
    //             <InputWrapper>
    //               <FloatingInput
    //                 type="number"
    //                 value={data.subId || ""}
    //                 required
    //                 name="sid"
    //                 placeholder=" "
    //                 maxLength={8}
    //                 onChange={(e) => {
    //                   dataChangeHandler("subId", Number(e.target.value));
    //                 }}
    //               />
    //               <FloatingLabel>Provide subject id here:</FloatingLabel>
    //             </InputWrapper>
    //           </InputContainer>
    //         </TeacherInputTabContainer>
    //         <div
    //           style={{
    //             display: "flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //           }}
    //         >
    //           <h3>Fill further details for the student's score:</h3>
    //         </div>
    //         <TeacherInputTabContainer>
    //           <InputContainer style={{ width: "50%" }}>
    //             <PiExamFill style={{ fontSize: "xx-large" }} />
    //             <InputWrapper>
    //               <FloatingInput
    //                 type="number"
    //                 value={data.theoryMarks || ""}
    //                 name="tm"
    //                 required
    //                 placeholder=" "
    //                 onChange={(e) => {
    //                   dataChangeHandler("theoryMarks", Number(e.target.value));
    //                 }}
    //               />
    //               <FloatingLabel>Provide theoritical marks:</FloatingLabel>
    //             </InputWrapper>
    //           </InputContainer>
    //           <InputContainer style={{ width: "50%" }}>
    //             <PiExamLight style={{ fontSize: "xx-large" }} />
    //             <InputWrapper>
    //               <FloatingInput
    //                 type="number"
    //                 value={data.practicalMarks || ""}
    //                 name="pm"
    //                 required
    //                 placeholder=" "
    //                 onChange={(e) => {
    //                   dataChangeHandler(
    //                     "practicalMarks",
    //                     Number(e.target.value)
    //                   );
    //                 }}
    //               />
    //               <FloatingLabel>Provide practical marks:</FloatingLabel>
    //             </InputWrapper>
    //           </InputContainer>
    //         </TeacherInputTabContainer>
    //         <ButtonContainer>
    //           <StyledButton type="submit">Submit</StyledButton>
    //         </ButtonContainer>
    //       </SearchForm>
    //     </SearchParamSection>
    //   </SearchBoxSection>
    //   {displayData !== undefined && displayData !== null ? (
    //     <SearchOutputSection>
    //       {typeof displayData === "string" ? (
    //         <div style={{ padding: "10px" }}>{displayData}</div>
    //       ) : (
    //         <></>
    //       )}
    //     </SearchOutputSection>
    //   ) : (
    //     <></>
    //   )}
    // </div>
  );
};
