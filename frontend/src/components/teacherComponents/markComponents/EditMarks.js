import { useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { FaCircleUser, FaOrcid } from "react-icons/fa6";
import { PiExamFill, PiExamLight } from "react-icons/pi";
import {
  GrNoOrSubIdValidation,
  PracticalMarksValidation,
  TheoryMarksValidation,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, SuccessToast, Toaster } from "../../../utils/toasterCode";
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

export const EditMarkTab = () => {
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    grNo: "",
    subjectId: "",
    theoryMarks: null,
    practicalMarks: null,
  };
  const [isValid, setIsValid] = useState(false);
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    if ((key === "grNo" || key === "subjectId") && data[key] !== value) {
      setIsValid(false);
      dataChangeHandler("theoryMarks", null);
      dataChangeHandler("practicalMarks", null);
    }
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const verifyHandler = async () => {
    try {
      const [resultForSubject, resultForStudent, markRecordExist] =
        await Promise.all([
          fetchApi(
            `http://localhost:8090/${userrole}/isValidSubject/${data.subjectId}`,
            "GET",
            {}
          ),
          fetchApi(
            `http://localhost:8090/${userrole}/isValidStudent/${data.grNo}`,
            "GET",
            {}
          ),
          fetchApi(
            `http://localhost:8090/${userrole}/isMarkRecordExist?grNo=${data.grNo}&subId=${data.subjectId}`,
            "GET",
            {}
          ),
        ]);
      if (
        resultForSubject.output !== "" &&
        resultForStudent.output !== "" &&
        markRecordExist.output !== ""
      ) {
        SuccessToast("Record exist! you can update the marks below.");
        setIsValid(true);
      }
    } catch (err) {
      ErrorToast(
        "Record doensot exist, please try creating one by clicking second link below"
      );
      console.log(err);
    }
  };

  const sumbitHandler = async (e, apiUrl) => {
    e.preventDefault();
    const errobj = {
      grno: { condition: false, message: "invalid gr no" },
      subjectId: { condition: false, message: "invalid sub id" },
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
    if (!GrNoOrSubIdValidation(data.subjectId)) {
      ErrorToast(errobj.subjectId.message);
      return;
    }
    try {
      let res;
      const payload = {
        grNo: Number(data.grNo),
        subId: Number(data.subjectId),
        theoryMarks: Number(data.theoryMarks),
        practicalMarks: Number(data.practicalMarks),
      };
      let bodyObj = {};
      for (const [key, value] of Object.entries(payload)) {
        if (value !== null && value !== undefined && value !== NaN) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "PUT", bodyObj);
      Toaster(res, toast);
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setInitialData();
    }
  };
  const setInitialData = () => {
    setData(initState);
    setIsValid(false);
  };

  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Edit student marks
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Update academic performance |{" "}
          <a href="/app/teacher/displayStudent" style={{ color: "#008cffff" }}>
            {" "}
            View particular student's performance
          </a>{" "}
          |{" "}
          <a href="/app/teacher/enterMarks" style={{ color: "#00c200" }}>
            {" "}
            Enter student marks record here
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
            value={data.subjectId}
            objKey={"subjectId"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"subId"}
            icon={FaOrcid}
            labelText={"Provide subject's ID:"}
          ></InputContainerComponent>
        </GridContainer>
        <GridLayers style={{ width: "50%" }}>
          <ButtonElement
            style={{ width: "100%" }}
            bgcol={"default"}
            border={"default"}
            textcol={"default"}
            hovercol={"default"}
            type="submit"
            onClick={() => verifyHandler()}
          >
            Verify here first to check if student and subject record exists
          </ButtonElement>
        </GridLayers>
      </ContentContainers>

      <LineBreak />
      {isValid ? (
        <div>
          <ContentContainers
            elements={"multiple"}
            style={{ marginTop: "1rem" }}
          >
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
          <ContentContainers
            elements={"multiple"}
            style={{ marginTop: "1rem" }}
          >
            <GridLayers style={{ width: "100%" }}>
              <ButtonElement
                style={{ width: "50%" }}
                bgcol={"default"}
                border={"default"}
                textcol={"default"}
                hovercol={"default"}
                type="submit"
                onClick={(e) =>
                  sumbitHandler(
                    e,
                    `http://localhost:8090/${userrole}/updateMarks`
                  )
                }
              >
                Update Marks
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
        </div>
      ) : (
        <></>
      )}
    </AllComponentsContainer>
    // <div>
    //   <PageHeading>Edit student's marks:</PageHeading>
    //   <SearchBoxSection>
    //     <ToastContainer />
    //     <SearchParamSection>
    //       <SearchForm
    //         onSubmit={(e) => {
    //           sumbitHandler(
    //             e,
    //             `http://localhost:8090/${userrole}/updateMarks`,
    //             {
    //               grNo: data.grNo,
    //               subId: data.subId,
    //               theoryMarks: data.theory,
    //               practicalMarks: data.practical,
    //             }
    //           );
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
    //               <FloatingLabel>Provide subject id:</FloatingLabel>
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
    //           <h3>Fill further details which you wish to edit:</h3>
    //         </div>
    //         <TeacherInputTabContainer>
    //           <InputContainer style={{ width: "50%" }}>
    //             <PiExamFill style={{ fontSize: "xx-large" }} />
    //             <InputWrapper>
    //               <FloatingInput
    //                 type="number"
    //                 value={data.theory || ""}
    //                 name="tm"
    //                 placeholder=" "
    //                 onChange={(e) => {
    //                   dataChangeHandler("theory", Number(e.target.value));
    //                 }}
    //               />
    //               <FloatingLabel>
    //                 Provide updated theoritical marks:
    //               </FloatingLabel>
    //             </InputWrapper>
    //           </InputContainer>
    //           <InputContainer style={{ width: "50%" }}>
    //             <PiExamLight style={{ fontSize: "xx-large" }} />
    //             <InputWrapper>
    //               <FloatingInput
    //                 type="number"
    //                 value={data.practical || ""}
    //                 name="pm"
    //                 placeholder=" "
    //                 onChange={(e) => {
    //                   dataChangeHandler("practical", Number(e.target.value));
    //                 }}
    //               />
    //               <FloatingLabel>
    //                 Provide updated practical marks:
    //               </FloatingLabel>
    //             </InputWrapper>
    //           </InputContainer>
    //         </TeacherInputTabContainer>
    //         <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
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
