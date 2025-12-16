import { useState } from "react";
import {
  GradeValidation,
  GrNoOrSubIdValidation,
  isNotEmptyPair,
  PasswordValidation,
  StringValidator,
  TeacherAdminIdValid,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { toast, ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import {
  SearchBoxSection,
  SearchForm,
  SearchOutputSection,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import { TeacherInputTabContainer } from "../TeachersTab";
import { ButtonContainer } from "../../teacherComponents/StudentsTab";
import { FaIdCardAlt } from "react-icons/fa";
import { FaAddressCard, FaKey } from "react-icons/fa6";
import { RiBookShelfLine, RiContactsBook2Fill } from "react-icons/ri";
import { MdWindow } from "react-icons/md";
import { StyledButton } from "../../../styled-components/StyledButton";
import { roleExtractor } from "../../../utils/roleExtractor";
import { InputContainerComponent } from "../../helperComponents/InputContainer";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";

export const TeacherEditComponent = () => {
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    teacherId: "",
    teacherPassword: "",
    subjectId: "",
    teacherName: "",
    sandardAllocated: "",
    sectionAllocated: "",
  };
  const [data, setData] = useState(initState);
  const [displayData, setDisplayData] = useState(null);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    const payload = {
      teacherId: Number(data.teacherId),
      tPwd: data.teacherPassword,
      subId: Number(data.subjectId),
      tName: data.teacherName,
      stdAllocated: Number(data.sandardAllocated),
      sectionAllocated: data.sectionAllocated,
    };
    const errobj = {
      std: {
        condition: false,
        message: "invalid standard. Allowed range is 1 - 12",
      },
      subid: { condition: false, message: "invalid sub id" },
      tid: { condition: false, message: "invalid teacher id" },
      section: { condition: false, message: "invalid section" },
      name: { condition: false, message: "invalid name" },
      pwd: {
        condition: false,
        message: "invalid password. it shall be of 8 digits",
      },
    };

    let errOccured = false;
    if (!TeacherAdminIdValid(payload.teacherId)) {
      ErrorToast(errobj.tid.message);
      errOccured = true;
    }

    if (payload.subId !== 0 && !GrNoOrSubIdValidation(payload.subId)) {
      errOccured = true;
      ErrorToast(errobj.subid.message);
    }

    if (payload.tPwd !== "" && !PasswordValidation(payload.tPwd)) {
      errOccured = true;
      ErrorToast(errobj.pwd.message);
    }

    if (payload.tName !== "" && !StringValidator(payload.tName)) {
      errOccured = true;
      ErrorToast(errobj.name.message);
    }

    if (payload.stdAllocated !== 0 && !GradeValidation(payload.stdAllocated)) {
      errOccured = true;
      ErrorToast(errobj.std.message);
    }

    if (
      payload.sectionAllocated !== "" &&
      !StringValidator(payload.sectionAllocated)
    ) {
      errOccured = true;
      ErrorToast(errobj.section.message);
    }
    if (errOccured) {
      return;
    }
    try {
      let res;
      let bodyObj = {};
      const numberKeys = ["stdAllocated", "subId", "teacherId"];
      for (const [key, value] of Object.entries(payload)) {
        if (isNaN(value) && numberKeys.includes(key)) {
          ErrorToast(`${key}'s value must be a number`);
          return;
        }
        if (isNotEmptyPair(value)) {
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
      if (!errOccured) {
        setData(initState);
      }
      e.target.reset();
    }
  };

  return (
    <div>
      <PageHeading>Edit teacher's details:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) => {
              submitHandler(e, `http://localhost:8090/${userrole}/editTeacher`);
            }}
          >
            <TeacherInputTabContainer>
              <InputContainerComponent
                width={"100%"}
                name={"tid"}
                value={data.teacherId}
                isRequired={true}
                handler={dataChangeHandler}
                objKey={"teacherId"}
                icon={FaIdCardAlt}
                labelText={"Provide Id for teacher you wish to update data:"}
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
                width={"50%"}
                name={"tname"}
                value={data.teacherName}
                handler={dataChangeHandler}
                objKey={"teacherName"}
                icon={FaAddressCard}
                labelText={"Provide new name:"}
              ></InputContainerComponent>
              <InputContainerComponent
                width={"50%"}
                name={"pwd"}
                value={data.teacherPassword}
                handler={dataChangeHandler}
                objKey={"teacherPassword"}
                icon={FaKey}
                labelText={"Provide new password here:"}
              ></InputContainerComponent>
            </TeacherInputTabContainer>
            <TeacherInputTabContainer>
              <InputContainerComponent
                width={"100%"}
                name={"subname"}
                value={data.subjectId}
                handler={dataChangeHandler}
                objKey={"subjectId"}
                icon={RiContactsBook2Fill}
                labelText={"Provide new subject assigned:"}
              ></InputContainerComponent>
            </TeacherInputTabContainer>
            <TeacherInputTabContainer>
              <InputContainerComponent
                width={"50%"}
                name={"std"}
                value={data.sandardAllocated}
                handler={dataChangeHandler}
                objKey={"sandardAllocated"}
                icon={RiBookShelfLine}
                labelText={"Provide new standard assigned:"}
              ></InputContainerComponent>
              <InputContainerComponent
                width={"50%"}
                name={"section"}
                value={data.sectionAllocated}
                handler={dataChangeHandler}
                objKey={"sectionAllocated"}
                icon={MdWindow}
                labelText={"Provide new section assigned:"}
              ></InputContainerComponent>
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
