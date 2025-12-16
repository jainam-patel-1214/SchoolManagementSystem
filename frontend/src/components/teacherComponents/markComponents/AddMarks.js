import { useState } from "react";
import {
  SearchBoxSection,
  SearchForm,
  SearchOutputSection,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import { toast, ToastContainer } from "react-toastify";
import {
  ButtonContainer,
  InputContainer,
  TeacherInputTabContainer,
} from "../StudentsTab";
import { FaCircleUser, FaOrcid } from "react-icons/fa6";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { PiExamFill, PiExamLight } from "react-icons/pi";
import { StyledButton } from "../../../styled-components/StyledButton";
import {
  GrNoOrSubIdValidation,
  PracticalMarksValidation,
  TheoryMarksValidation,
} from "../../../utils/validations";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { fetchApi } from "../../../utils/fetchApiCode";
import { roleExtractor } from "../../../utils/roleExtractor";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";

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
  const [displayData, setDisplayData] = useState(null);
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
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
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setData(initState);
      e.target.reset();
    }
  };

  return (
    <div>
      <PageHeading>Enter new marks record for student:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) => {
              submitHandler(e, `http://localhost:8090/${userrole}/enterMarks`);
            }}
          >
            <TeacherInputTabContainer>
              <InputContainer style={{ width: "50%" }}>
                <FaCircleUser style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="number"
                    value={data.grNo || ""}
                    required
                    name="grno"
                    placeholder=" "
                    maxLength={8}
                    onChange={(e) => {
                      dataChangeHandler("grNo", Number(e.target.value));
                    }}
                  />
                  <FloatingLabel>Provide Gr NO for student:</FloatingLabel>
                </InputWrapper>
              </InputContainer>
              <InputContainer style={{ width: "50%" }}>
                <FaOrcid style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="number"
                    value={data.subId || ""}
                    required
                    name="sid"
                    placeholder=" "
                    maxLength={8}
                    onChange={(e) => {
                      dataChangeHandler("subId", Number(e.target.value));
                    }}
                  />
                  <FloatingLabel>Provide subject id here:</FloatingLabel>
                </InputWrapper>
              </InputContainer>
            </TeacherInputTabContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h3>Fill further details for the student's score:</h3>
            </div>
            <TeacherInputTabContainer>
              <InputContainer style={{ width: "50%" }}>
                <PiExamFill style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="number"
                    value={data.theoryMarks || ""}
                    name="tm"
                    required
                    placeholder=" "
                    onChange={(e) => {
                      dataChangeHandler("theoryMarks", Number(e.target.value));
                    }}
                  />
                  <FloatingLabel>Provide theoritical marks:</FloatingLabel>
                </InputWrapper>
              </InputContainer>
              <InputContainer style={{ width: "50%" }}>
                <PiExamLight style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="number"
                    value={data.practicalMarks || ""}
                    name="pm"
                    required
                    placeholder=" "
                    onChange={(e) => {
                      dataChangeHandler(
                        "practicalMarks",
                        Number(e.target.value)
                      );
                    }}
                  />
                  <FloatingLabel>Provide practical marks:</FloatingLabel>
                </InputWrapper>
              </InputContainer>
            </TeacherInputTabContainer>
            <ButtonContainer>
              <StyledButton type="submit">Submit</StyledButton>
            </ButtonContainer>
          </SearchForm>
        </SearchParamSection>
      </SearchBoxSection>
      {displayData !== undefined && displayData !== null ? (
        <SearchOutputSection>
          {typeof displayData === "string" ? (
            <div style={{ padding: "10px" }}>{displayData}</div>
          ) : (
            <></>
          )}
        </SearchOutputSection>
      ) : (
        <></>
      )}
    </div>
  );
};
