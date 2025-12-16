import { ToastContainer, toast } from "react-toastify";
import { useState } from "react";
import { StyledButton } from "../../styled-components/StyledButton";
import {
  SearchBoxSection,
  SearchForm,
  SearchParamSection,
} from "../studentComponents/SchoolResult";
import { ButtonContainer } from "../teacherComponents/StudentsTab";
import { TeacherInputTabContainer } from "./TeachersTab";
import { RiBookShelfLine } from "react-icons/ri";
import { GiBookPile } from "react-icons/gi";
import { ErrorToast, Toaster } from "../../utils/toasterCode";
import { fetchApi } from "../../utils/fetchApiCode";
import { roleExtractor } from "../../utils/roleExtractor";
import { GradeValidation } from "../../utils/validations";
import { InputContainerComponent } from "../helperComponents/InputContainer";

export const SubjectLimit = () => {
  const [data, setData] = useState({ grade: 0, limit: 0 });
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const setSubLim = async (e) => {
    e.preventDefault();
    if (!GradeValidation(data.grade)) {
      ErrorToast("invalid grade given. It shall be between 1-12");
      return;
    }
    if (data.limit < 0) {
      ErrorToast("negative limit not allowed");
      return;
    }

    try {
      const role = roleExtractor(window.location.pathname);
      const payload = { std: data.grade, limit: data.limit };
      const res = await fetchApi(
        `http://localhost:8090/${role}/setSubLimit`,
        "POST",
        payload
      );
      Toaster(res, toast);
    } catch (error) {
      ErrorToast(error, toast);
    } finally {
      setData({ grade: 0, limit: 0 });
      e.target.reset();
    }
  };
  return (
    <div>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) => {
              setSubLim(e);
            }}
          >
            <TeacherInputTabContainer>
              <InputContainerComponent
                isRequired={true}
                width={"50%"}
                icon={RiBookShelfLine}
                name={"std"}
                handler={dataChangeHandler}
                objKey={"grade"}
                labelText={"Provide grade of class you wish to set limit:"}
                value={data.grade}
              ></InputContainerComponent>
              <InputContainerComponent
                isRequired={true}
                width={"50%"}
                icon={GiBookPile}
                name={"limit"}
                handler={dataChangeHandler}
                objKey={"limit"}
                labelText={"Provide limit of subjects for this standard:"}
                value={data.limit}
              ></InputContainerComponent>
            </TeacherInputTabContainer>
            <ButtonContainer>
              <StyledButton type="submit">Submit</StyledButton>
            </ButtonContainer>
          </SearchForm>
        </SearchParamSection>
      </SearchBoxSection>
    </div>
  );
};
