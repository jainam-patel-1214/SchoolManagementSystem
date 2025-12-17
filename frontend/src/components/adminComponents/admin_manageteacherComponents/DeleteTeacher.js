import { useState } from "react";
import {
  SearchBoxSection,
  SearchForm,
  SearchOutputSection,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import { toast, ToastContainer } from "react-toastify";
import { TeacherInputTabContainer } from "../TeachersTab";
import {
  ButtonContainer,
  InputContainer,
} from "../../teacherComponents/StudentsTab";
import { FaIdCardAlt } from "react-icons/fa";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { StyledButton } from "../../../styled-components/StyledButton";
import { TeacherAdminIdValid } from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { roleExtractor } from "../../../utils/roleExtractor";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";

export const TeacherDelComponent = () => {
  const userrole = roleExtractor(window.location.pathname);
  const [teacherId, setTeacherId] = useState(0);
  const [displayData, setDisplayData] = useState(null);

  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (!TeacherAdminIdValid(teacherId)) {
      ErrorToast("invalid teacher id");
      return;
    }
    try {
      let res;
      res = await fetchApi(apiUrl, "DELETE", { teacherId: teacherId });
      Toaster(res);
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setTeacherId(null);
      e.target.reset();
    }
  };

  return (
    <div>
      <PageHeading>Delete a teacher:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) => {
              submitHandler(e, `http://localhost:8090/${userrole}/delTeacher`);
            }}
          >
            <TeacherInputTabContainer>
              <InputContainer>
                <FaIdCardAlt style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="number"
                    name="teacherId"
                    value={teacherId || ""}
                    required
                    placeholder=" "
                    onChange={(e) => {
                      setTeacherId(Number(e.target.value));
                    }}
                  />
                  <FloatingLabel>
                    Provide id of teacher you wish to delete:
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
      {displayData !== null && displayData !== undefined ? (
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
