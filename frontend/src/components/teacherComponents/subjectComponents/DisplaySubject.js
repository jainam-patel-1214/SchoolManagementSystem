import { useState } from "react";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { toast, ToastContainer } from "react-toastify";
import {
  SearchBoxSection,
  SearchForm,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import {
  ButtonContainer,
  InputContainer,
  TeacherInputTabContainer,
} from "../StudentsTab";
import { RiBookShelfLine } from "react-icons/ri";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { StyledButton } from "../../../styled-components/StyledButton";
import { ReactTableComponent } from "../../helperComponents/ResultTable";
import { GradeValidation } from "../../../utils/validations";
import { roleExtractor } from "../../../utils/roleExtractor";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";

export const DisplaySubTabComp = () => {
  const userrole = roleExtractor(window.location.pathname);
  const [std, setStd] = useState(null);
  const [displayData, setDisplayData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const SuperScriptText = (num) => {
    switch (num) {
      case 1:
        return "st";
      case 2:
        return "nd";
      case 3:
        return "rd";
      default:
        return "th";
    }
  };
  const subjectColumnDef = [
    {
      header: "Subject Id",
      accessorKey: "subjectId",
    },
    {
      header: "Name",
      accessorKey: "subjectName",
    },
    {
      header: "Standard",
      accessorKey: "level",
    },
    {
      header: "Credits",
      accessorKey: "credits",
    },
  ];
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (!GradeValidation(std)) {
      ErrorToast("invalid grade. Allowed range is 1 - 12");
      return;
    }
    try {
      let res;
      setIsLoading(true);
      res = await fetchApi(
        apiUrl + "?" + new URLSearchParams({ std: std }),
        "GET",
        {}
      );
      Toaster(res, toast);
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setIsLoading(false);
      setStd(null);
      e.target.reset();
    }
  };

  return (
    <div>
      <PageHeading>Display Subjects:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) => {
              submitHandler(e, `http://localhost:8090/${userrole}/displaySub`);
            }}
          >
            <TeacherInputTabContainer>
              <InputContainer>
                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="number"
                    name="substd"
                    value={std || ""}
                    placeholder=" "
                    onChange={(e) => {
                      setStd(Number(e.target.value));
                    }}
                  />
                  <FloatingLabel>
                    Provide standard to search associated subjects :
                  </FloatingLabel>
                </InputWrapper>
              </InputContainer>
            </TeacherInputTabContainer>
            <ButtonContainer>
              <StyledButton type="submit">Submit</StyledButton>
            </ButtonContainer>
          </SearchForm>
        </SearchParamSection>
      </SearchBoxSection>
      {isLoading || displayData.length === 0 ? (
        <>Fetching Data</>
      ) : (
        <>
          {typeof displayData !== "string" && displayData?.length > 0 ? (
            <ReactTableComponent
              data={displayData}
              columnDefinition={subjectColumnDef}
              heading={
                <>
                  List of subject in {displayData[0].level}{" "}
                  <sup>{SuperScriptText(Number(displayData[0].level))}</sup>{" "}
                  standard
                </>
              }
            ></ReactTableComponent>
          ) : (
            <></>
          )}
        </>
      )}
    </div>
  );
};
