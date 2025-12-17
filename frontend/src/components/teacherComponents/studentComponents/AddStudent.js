import { useState } from "react";
import {
  GradeValidation,
  GrNoOrSubIdValidation,
  PasswordValidation,
  StringValidator,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { toast, ToastContainer } from "react-toastify";
import { FaAddressCard, FaCircleUser, FaKey } from "react-icons/fa6";
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
import { useNavigate } from "react-router-dom";

export const StudentAddComponent = () => {
  const navigate = useNavigate();
  const initState = {
    grNo: "",
    std: "",
    section: "",
    name: "",
    password: "",
  };
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const setInitialData = () => {
    setData(initState);
  };

  const sumbitHandler = async (e, apiUrl) => {
    e.preventDefault();
    const errobj = {
      grno: { condition: false, message: "invalid gr no" },
      password: {
        condition: false,
        message: "passwords are needed to be 8 digits",
      },
      std: { condition: false, message: "standard shall have range of 1 - 12" },
      name: { condition: false, message: "invalid name" },
      section: { condition: false, message: "invalid section" },
    };
    if (
      data.grNo === "" ||
      data.name === "" ||
      data.password === "" ||
      data.section === "" ||
      data.std === ""
    ) {
      ErrorToast("Fill all the values below");
      return;
    }
    if (!PasswordValidation(data.password)) {
      ErrorToast(errobj.password.message);
      return;
    }
    if (!GrNoOrSubIdValidation(data.grNo)) {
      ErrorToast(errobj.grno.message);
      return;
    }
    if (!GradeValidation(data.std)) {
      ErrorToast(errobj.std.message);
      return;
    }
    if (!StringValidator(data.name)) {
      ErrorToast(errobj.name.message);
      return;
    }
    if (!StringValidator(data.section)) {
      ErrorToast(errobj.section.message);
      return;
    }
    try {
      let res;
      let bodyObj = {};
      const payload = {
        grNo: Number(data.grNo),
        userRole: "student",
        studName: data.name,
        studPwd: data.password,
        section: data.section,
        std: Number(data.std),
      };
      for (const [key, value] of Object.entries(payload)) {
        if (
          value !== null &&
          value !== undefined &&
          value !== NaN &&
          value !== 0
        ) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "POST", bodyObj);
      Toaster(res, toast);
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setInitialData();
    }
  };
  const userrole = roleExtractor(window.location.pathname);
  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          New Student Enrollment
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Create a student profile and get them started right away |{" "}
          <a href="/app/teacher/displayStudent" style={{ color: "#008cffff" }}>
            {" "}
            Go back to veiw student list
          </a>
        </p>
      </HeadingComponent>

      <ContentContainers elements={"single"} usage={"nongrid"}>
        <InputContainerComponent
          value={data.grNo}
          objKey={"grNo"}
          width={"100%"}
          handler={dataChangeHandler}
          name={"grNo"}
          isRequired={true}
          icon={FaCircleUser}
          labelText={"Provide unique GrNO for student you wish to create:"}
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
            value={data.password}
            objKey={"password"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"password"}
            isRequired={true}
            icon={FaKey}
            labelText={"Assign new 8 digit password:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.name}
            objKey={"name"}
            width={"auto"}
            handler={dataChangeHandler}
            isRequired={true}
            name={"name"}
            icon={FaAddressCard}
            labelText={"Provide student's name:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.section}
            objKey={"section"}
            width={"auto"}
            handler={dataChangeHandler}
            isRequired={true}
            name={"section"}
            icon={MdWindow}
            labelText={"Assign new section:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.std}
            objKey={"std"}
            width={"auto"}
            handler={dataChangeHandler}
            isRequired={true}
            name={"std"}
            icon={RiBookShelfLine}
            labelText={"Assign new std:"}
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
            onClick={(e) =>
              sumbitHandler(e, `http://localhost:8090/${userrole}/createStud`)
            }
          >
            Create Student
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
                navigate("/app/teacher/displayStudent");
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
