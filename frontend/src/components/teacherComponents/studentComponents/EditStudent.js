import { useEffect, useRef, useState } from "react";
import {
  GradeValidation,
  GrNoSubIdTeacherIdAdminIdValidation,
  PasswordValidation,
  StringValidator,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ToastContainer } from "react-toastify";
import { ErrorToast, SuccessToast, Toaster } from "../../../utils/toasterCode";
import { FaAddressCard, FaKey } from "react-icons/fa6";
import { MdWindow } from "react-icons/md";
import { RiBookShelfLine } from "react-icons/ri";
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
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridLayers } from "../../helperComponents/GridItem";
import { useParams } from "react-router-dom";

export const StudentEditComponent = () => {
  const userrole = roleExtractor(window.location.pathname);
  const [data, setData] = useState({});
  const originalData = useRef({});
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const { id } = useParams();
  useEffect(() => {
    if (!id) return;
    searchStudent(id);
  }, []);
  const searchStudent = async (id) => {
    try {
      const studentData = await fetchApi(
        `/${userrole}/studentData/${id}`,
        "GET",
        {}
      );
      if (studentData.output && typeof studentData.output !== "string") {
        const initState = {
          grNo: "",
          standard: "",
          section: "",
          name: "",
          password: "",
        };
        initState.grNo = studentData.output.grNo || "";
        initState.standard = studentData.output.grade || "";
        initState.section = studentData.output.section || "";
        initState.name = studentData.output.studentName || "";
        initState.password = studentData.output.studentPwd || "";
        setData(initState);
        originalData.current = initState;
      }
    } catch (error) {
      ErrorToast("Student doesnot exists you wish to edit, try again!!");
    }
  };

  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    let isUpdateNeeded = false;
    for (const [key, value] of Object.entries(data)) {
      if (value !== originalData.current[key]) {
        isUpdateNeeded = true;
      }
    }
    if (!isUpdateNeeded) {
      SuccessToast("You have not updated any values.");
      return;
    }
    const errobj = {
      grno: { condition: false, message: "invalid gr no" },
      password: {
        condition: false,
        message: "passwords are needed to be atleast 8 digits",
      },
      std: { condition: false, message: "standard shall have range of 1 - 12" },
      name: { condition: false, message: "invalid name" },
      section: { condition: false, message: "invalid section" },
    };
    if (data.password !== "" && !PasswordValidation(data.password)) {
      ErrorToast(errobj.password.message);
      return;
    }
    if (
      data.grNo !== "" &&
      !GrNoSubIdTeacherIdAdminIdValidation(Number(data.grNo))
    ) {
      ErrorToast(errobj.grno.message);
      return;
    }
    if (data.standard !== "" && !GradeValidation(Number(data.standard))) {
      ErrorToast(errobj.std.message);
      return;
    }
    if (data.name !== "" && !StringValidator(data.name)) {
      ErrorToast(errobj.name.message);
      return;
    }
    if (data.section !== "" && !StringValidator(data.section)) {
      ErrorToast(errobj.section.message);
      return;
    }
    try {
      let res;
      let bodyObj = {};
      const payload = {
        grNo: Number(data.grNo),
        studName: data.name,
        studPwd: data.password,
        section: data.section,
        std: Number(data.standard),
      };
      console.log(payload);

      for (const [key, value] of Object.entries(payload)) {
        if (value !== null && value !== undefined && value !== 0) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "PUT", bodyObj);
      if (res.output) {
        originalData.current = { ...data };
      }
      Toaster(res);
    } catch (err) {
      ErrorToast(err);
    } finally {
      setInitialData();
    }
  };

  const setInitialData = () => {
    setData(originalData.current);
  };

  return (
    <AllComponentsContainer className="parent-container">
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Edit student
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Update the student's details here |{" "}
          <a
            href={`/app/${userrole}/displayStudent`}
            style={{ color: "#008cffff" }}
          >
            {" "}
            Go back to view student list
          </a>
        </p>
      </HeadingComponent>

      <LineBreak />

      <HeadingComponent position={"top"}>
        <PageHeading>
          You can change below fields and click update to update student's
          values:
        </PageHeading>
      </HeadingComponent>
      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <GridContainer>
          <InputContainerComponent
            value={data.password || ""}
            objKey={"password"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"password"}
            icon={FaKey}
            labelText={"Provide new password:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.name || ""}
            objKey={"name"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"name"}
            icon={FaAddressCard}
            labelText={"Provide new name:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.section || ""}
            objKey={"section"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"section"}
            icon={MdWindow}
            labelText={"Provide new section:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.standard || ""}
            objKey={"standard"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"std"}
            icon={RiBookShelfLine}
            labelText={"Provide new std:"}
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
            onClick={(e) => submitHandler(e, `/${userrole}/updateStud`)}
          >
            Update Student
          </ButtonElement>
          <GridLayers style={{ width: "48%", margin: "0" }}>
            <ButtonElement
              style={{ width: "100%" }}
              bgcol={"transparent"}
              border={"1px solid #b5b5b5af"}
              textcol={"red"}
              hovercol={"#ffd3d3af"}
              type="reset"
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
