import { useEffect, useRef, useState } from "react";
import {
  GradeValidation,
  GrNoSubIdTeacherIdAdminIdValidation,
  isNotEmptyPair,
  PasswordValidation,
  StringValidator,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { FaIdCardAlt } from "react-icons/fa";
import { FaAddressCard, FaKey } from "react-icons/fa6";
import { RiBookShelfLine, RiContactsBook2Fill } from "react-icons/ri";
import { MdWindow } from "react-icons/md";
import { roleExtractor } from "../../../utils/roleExtractor";
import { InputContainerComponent } from "../../helperComponents/InputContainer";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  GridContainer,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../../styled-components/HelperStyledComponents";
import { useNavigate } from "react-router-dom";
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridLayers } from "../../helperComponents/GridItem";

export const CreateTeacherComponent = () => {
  const userrole = roleExtractor(window.location.pathname);
  const navigate = useNavigate();
  const userList = useRef([]);
  const initState = {
    teacherId: "",
    teacherPassword: "",
    subjectId: "",
    teacherName: "",
    standardAllocated: "",
    sectionAllocated: "",
  };
  const [data, setData] = useState(initState);
  const [idErrorMessage, setIdErrorMessage] = useState("");
  const [idNotAvailable, setIdNotAvailable] = useState(false);
  const setInitialData = () => {
    setData(initState);
  };
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (
      data.teacherId === "" ||
      data.teacherName === "" ||
      data.teacherPassword === ""
    ) {
      ErrorToast(
        "Atleast Teacher's ID, name and password are required to create new teacher"
      );
      return;
    }
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
    if (!GrNoSubIdTeacherIdAdminIdValidation(payload.teacherId)) {
      ErrorToast(errobj.tid.message);
      return;
    }

    if (
      payload.subId !== 0 &&
      !GrNoSubIdTeacherIdAdminIdValidation(payload.subId)
    ) {
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
      Toaster(res);
      if (res.output) {
        fetchTeachers();
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setInitialData();
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetchApi(`/admin/allTeachers`, "GET", {});
      if (res.output && typeof res.output !== "string") {
        userList.current = res.output;
        return;
      } else {
        userList.current = [];
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    let flag = false;
    if (data.teacherId === "") {
      setIdErrorMessage("");
      setIdNotAvailable(false);
      return;
    }
    userList.current.forEach((e) => {
      if (e.teacherId == data.teacherId) flag = true;
    });
    setIdNotAvailable(flag);
    if (flag) {
      setIdErrorMessage(`(THIS ID IS ALREADY OCCUPIED)`);
    } else {
      setIdErrorMessage(`ID AVAILABLE`);
    }
  }, [data.teacherId]);

  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Appoint New Teacher
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Create new teacher profile and get them started right away |{" "}
          <a
            href={`/app/${userrole}/displayTeacher`}
            style={{ color: "#008cffff" }}
          >
            {" "}
            Go back to view teacher's list
          </a>
        </p>
      </HeadingComponent>

      <ContentContainers elements={"single"} usage={"nongrid"}>
        <InputContainerComponent
          icon={FaIdCardAlt}
          width={"100%"}
          handler={dataChangeHandler}
          value={data.teacherId}
          name={"tid"}
          objKey={"teacherId"}
          labelText={
            idErrorMessage || "Provide Id for new teacher to be created:"
          }
          errorColor={idNotAvailable ? "#FF0000" : "default"}
        ></InputContainerComponent>
      </ContentContainers>

      <LineBreak />

      <HeadingComponent position={"top"}>
        <PageHeading>
          Ensure all required information below is filled in accurately:
        </PageHeading>
      </HeadingComponent>
      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <GridContainer>
          <InputContainerComponent
            icon={FaAddressCard}
            labelText={"Provide teacher's name:"}
            width={"auto"}
            handler={dataChangeHandler}
            value={data.teacherName}
            name={"tname"}
            objKey={"teacherName"}
          ></InputContainerComponent>
          <InputContainerComponent
            icon={RiContactsBook2Fill}
            labelText={"Provide subject to be assigned:"}
            width={"auto"}
            handler={dataChangeHandler}
            value={data.subjectId}
            name={"subname"}
            objKey={"subjectId"}
          ></InputContainerComponent>
          <InputContainerComponent
            icon={FaKey}
            labelText={"Provide password for teacher:"}
            width={"auto"}
            handler={dataChangeHandler}
            value={data.teacherPassword}
            name={"password"}
            objKey={"teacherPassword"}
          ></InputContainerComponent>
          <InputContainerComponent
            width={"auto"}
            value={data.standardAllocated}
            name={"std"}
            handler={dataChangeHandler}
            objKey={"standardAllocated"}
            icon={RiBookShelfLine}
            labelText={"Provide standard to be assigned:"}
          ></InputContainerComponent>
          <InputContainerComponent
            width={"auto"}
            value={data.sectionAllocated}
            name={"section"}
            handler={dataChangeHandler}
            objKey={"sectionAllocated"}
            icon={MdWindow}
            labelText={"Provide section to be assigned:"}
          ></InputContainerComponent>
        </GridContainer>
      </ContentContainers>
      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <GridLayers style={{ width: "100%" }}>
          <ButtonElement
            style={{ width: "50%" }}
            bgcol={"default"}
            border={"default"}
            textcol={"default"}
            hovercol={"default"}
            type="submit"
            onClick={(e) => submitHandler(e, `/${userrole}/addTeacher`)}
          >
            Create Teacher
          </ButtonElement>
          <GridLayers style={{ width: "48%", margin: "0" }}>
            <ButtonElement
              style={{ width: "48%" }}
              bgcol={"transparent"}
              border={"1px solid #b5b5b5af"}
              textcol={"green"}
              hovercol={"#dcfff487"}
              onClick={() => {
                setInitialData();
                navigate(`/app/${userrole}/displayTeacher`);
              }}
            >
              Cancel
            </ButtonElement>
            <ButtonElement
              style={{ width: "48%" }}
              bgcol={"transparent"}
              border={"1px solid #b5b5b5af"}
              textcol={"red"}
              hovercol={"#ffd3d3af"}
              onClick={() => setInitialData()}
            >
              Reset
            </ButtonElement>
          </GridLayers>
        </GridLayers>
      </ContentContainers>
    </AllComponentsContainer>
  );
};
