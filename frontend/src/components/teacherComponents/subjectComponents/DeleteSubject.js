import { toast, ToastContainer } from "react-toastify";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { GrNoOrSubIdValidation } from "../../../utils/validations";
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
import { FaOrcid } from "react-icons/fa6";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { StyledButton } from "../../../styled-components/StyledButton";
import { useState } from "react";
import { roleExtractor } from "../../../utils/roleExtractor";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";

export const SubDelTabComp = () => {
  const [subId, setSubId] = useState(0);
  const [displayData, setDisplayData] = useState(null);
  const userrole = roleExtractor(window.location.pathname);
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (!GrNoOrSubIdValidation(subId)) {
      ErrorToast("invalid sub id");
      return;
    }
    try {
      let res;
      res = await fetchApi(apiUrl, "DELETE", { subId: subId });
      Toaster(res);
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setSubId(null);
      e.target.reset();
    }
  };
  return (
    <div>
      <PageHeading>Delete a subject:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) =>
              submitHandler(e, `http://localhost:8090/${userrole}/delSubject`)
            }
          >
            <TeacherInputTabContainer>
              <InputContainer>
                <FaOrcid style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="number"
                    name="subId"
                    value={subId || ""}
                    placeholder=" "
                    onChange={(e) => {
                      setSubId(Number(e.target.value));
                    }}
                  />
                  <FloatingLabel>
                    Provide subId of subject you wish to delete:
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
