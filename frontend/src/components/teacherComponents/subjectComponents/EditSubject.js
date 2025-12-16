import { useState } from "react";
import {
  GradeValidation,
  GrNoOrSubIdValidation,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { toast, ToastContainer } from "react-toastify";
import {
  SearchBoxSection,
  SearchForm,
  SearchOutputSection,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import { ButtonContainer, TeacherInputTabContainer } from "../StudentsTab";
import { FaOrcid } from "react-icons/fa6";
import { RiBookShelfLine } from "react-icons/ri";
import { IoIosRibbon } from "react-icons/io";
import { LuBookA } from "react-icons/lu";
import { StyledButton } from "../../../styled-components/StyledButton";
import { roleExtractor } from "../../../utils/roleExtractor";
import { InputContainerComponent } from "../../helperComponents/InputContainer";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";

export const SubEditTabComp = () => {
  const initState = {
    subjectId: "",
    subjectName: "",
    subjectCredit: null,
    subjectStd: "",
  };
  const [data, setData] = useState(initState);
  const [displayData, setDisplayData] = useState(null);
  const userrole = roleExtractor(window.location.pathname);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (!GradeValidation(Number(data.subjectStd))) {
      ErrorToast("invalid grade. Allowed range is 1 - 12");
      return;
    }
    if (!GrNoOrSubIdValidation(Number(data.subjectId))) {
      ErrorToast("invalid sub id");
      return;
    }
    if (Number(data.subjectCredit) < 0) {
      ErrorToast("credits cannot be less than 0");
      return;
    }
    try {
      let res;
      let bodyObj = {};
      const payload = {
        subId: Number(data.subjectId),
        subName: data.subjectName,
        credits: Number(data.subjectCredit),
        levelStd: Number(data.subjectStd),
      };
      for (const [key, value] of Object.entries(payload)) {
        if (value !== null && value !== undefined && value !== NaN) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "PUT", bodyObj);
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
      <PageHeading>Edit any subject:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) =>
              submitHandler(e, `http://localhost:8090/${userrole}/updateSub`)
            }
          >
            <TeacherInputTabContainer>
              <InputContainerComponent
                value={data.subjectId}
                objKey={"subjectId"}
                width={"100%"}
                handler={dataChangeHandler}
                name={"subid"}
                icon={FaOrcid}
                isRequired={true}
                labelText={"Provide SubId for subject to be updated:"}
              ></InputContainerComponent>
            </TeacherInputTabContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h3>Only fill the fields you wish to update data:</h3>
            </div>
            <TeacherInputTabContainer>
              <InputContainerComponent
                value={data.subjectName}
                objKey={"subjectName"}
                width={"33.3%"}
                handler={dataChangeHandler}
                name={"subname"}
                icon={LuBookA}
                isRequired={true}
                labelText={"Provide subject name:"}
              ></InputContainerComponent>
              <InputContainerComponent
                value={data.subjectCredit}
                objKey={"subjectCredit"}
                width={"33.3%"}
                handler={dataChangeHandler}
                name={"credits"}
                icon={IoIosRibbon}
                labelText={"Provide new credit:"}
              ></InputContainerComponent>
              <InputContainerComponent
                value={data.subjectStd}
                objKey={"subjectStd"}
                width={"33.3%"}
                handler={dataChangeHandler}
                name={"subLevel"}
                icon={RiBookShelfLine}
                labelText={"Provide updated grade:"}
              ></InputContainerComponent>
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
