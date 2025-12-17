import { useState } from "react";
import { GrNoOrSubIdValidation } from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { toast, ToastContainer } from "react-toastify";
import {
  SearchBoxSection,
  SearchForm,
  SearchOutputSection,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import {
  ButtonContainer,
  InputContainer,
  TeacherInputTabContainer,
} from "../StudentsTab";
import { FaCircleUser } from "react-icons/fa6";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { StyledButton } from "../../../styled-components/StyledButton";
import { roleExtractor } from "../../../utils/roleExtractor";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";

export const StudentDelComponent = () => {
  const userrole = roleExtractor(window.location.pathname);
  const [grNo, setGrNo] = useState(0);
  const [displayData, setDisplayData] = useState(null);

  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (!GrNoOrSubIdValidation(grNo)) {
      ErrorToast("invalid gr no");
      return;
    }
    try {
      let res;
      res = await fetchApi(apiUrl, "DELETE", { grNo: grNo });
      Toaster(res);
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setGrNo(null);
      e.target.reset();
    }
  };

  return (
    <div>
      <PageHeading>Delete a student:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) =>
              submitHandler(e, `http://localhost:8090/${userrole}/delStudent`)
            }
          >
            <TeacherInputTabContainer>
              <InputContainer>
                <FaCircleUser style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="number"
                    value={grNo || ""}
                    name="grNo"
                    required
                    placeholder=" "
                    onChange={(e) => setGrNo(Number(e.target.value))}
                  />
                  <FloatingLabel>
                    Enter Gr No of student you wish to delete:
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
      {displayData !== undefined && displayData !== null ? (
        <SearchOutputSection>
          {typeof displayData === "string" &&
          (displayData !== undefined || displayData !== null) ? (
            <div>{displayData}</div>
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
