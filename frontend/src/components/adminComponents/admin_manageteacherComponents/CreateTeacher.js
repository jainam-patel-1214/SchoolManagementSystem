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

export const CreateTeacherComponent = () => {
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    teacherId: "",
    teacherPassword: "",
    subjectId: "",
    teacherName: "",
    standardAllocated: "",
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
    const payload = {
      teacherId: Number(data.teacherId),
      tPwd: data.teacherPassword,
      subId: Number(data.subjectId),
      tName: data.teacherName,
      stdAllocated: Number(data.standardAllocated),
      sectionAllocated: data.sectionAllocated,
    };
    if (!TeacherAdminIdValid(payload.teacherId)) {
      ErrorToast(errobj.tid.message);
      return;
    }

    if (payload.subId !== 0 && !GrNoOrSubIdValidation(payload.subId)) {
      ErrorToast(errobj.subid.message);
      return;
    }

    if (payload.tPwd === "" || !PasswordValidation(payload.tPwd)) {
      ErrorToast(errobj.pwd.message);
      return;
    }

    if (payload.tName === "" || !StringValidator(payload.tName)) {
      ErrorToast(errobj.name.message);
      return;
    }

    if (payload.stdAllocated !== 0 && !GradeValidation(payload.stdAllocated)) {
      ErrorToast(errobj.std.message);
      return;
    }

    if (
      payload.sectionAllocated !== "" &&
      !StringValidator(payload.sectionAllocated)
    ) {
      ErrorToast(errobj.section.message);
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
      bodyObj["role"] = "teacher";
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
      <PageHeading>Create new teacher:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) => {
              submitHandler(e, `http://localhost:8090/${userrole}/addTeacher`);
            }}
          >
            <TeacherInputTabContainer>
              <InputContainerComponent
                icon={FaIdCardAlt}
                labelText={"Provide Id for new teacher to be created:"}
                width={"100%"}
                handler={dataChangeHandler}
                value={data.teacherId}
                name={"tid"}
                objKey={"teacherId"}
                isRequired={true}
              ></InputContainerComponent>
            </TeacherInputTabContainer>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <h3>Provide further details of teacher:</h3>
            </div>
            <TeacherInputTabContainer>
              <InputContainerComponent
                icon={FaAddressCard}
                labelText={"Provide teacher's name:"}
                width={"50%"}
                isRequired={true}
                handler={dataChangeHandler}
                value={data.teacherName}
                name={"tname"}
                objKey={"teacherName"}
              ></InputContainerComponent>
              <InputContainerComponent
                icon={RiContactsBook2Fill}
                labelText={"Provide subject to be assigned:"}
                width={"50%"}
                handler={dataChangeHandler}
                value={data.subjectId}
                name={"subname"}
                objKey={"subjectId"}
              ></InputContainerComponent>
            </TeacherInputTabContainer>
            <TeacherInputTabContainer>
              <InputContainerComponent
                icon={FaKey}
                labelText={"Provide password for teacher:"}
                width={"100%"}
                isRequired={true}
                handler={dataChangeHandler}
                value={data.teacherPassword}
                name={"password"}
                objKey={"teacherPassword"}
              ></InputContainerComponent>
            </TeacherInputTabContainer>
            <TeacherInputTabContainer>
              <InputContainerComponent
                width={"50%"}
                value={data.standardAllocated}
                name={"std"}
                handler={dataChangeHandler}
                objKey={"standardAllocated"}
                icon={RiBookShelfLine}
                labelText={"Provide standard to be assigned:"}
              ></InputContainerComponent>
              <InputContainerComponent
                width={"50%"}
                value={data.sectionAllocated}
                name={"section"}
                handler={dataChangeHandler}
                objKey={"sectionAllocated"}
                icon={MdWindow}
                labelText={"Provide section to be assigned:"}
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
