import { useEffect, useState } from "react";
import {
  GradeValidation,
  GrNoSubIdTeacherIdAdminIdValidation,
  PasswordValidation,
  StringValidator,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ToastContainer } from "react-toastify";
import { ErrorToast, SuccessToast, Toaster } from "../../../utils/toasterCode";
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
import { useNavigate, useParams } from "react-router-dom";

export const StudentEditComponent = () => {
  const navigate = useNavigate();
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    grNo: "",
    std: "",
    section: "",
    name: "",
    password: "",
  };
  const [data, setData] = useState(initState);
  const [isValid, setIsValid] = useState(false);
  const dataChangeHandler = (key, value) => {
    if (key === "grNo") {
      setIsValid(false);
    }
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
      const isValidRes = await fetchApi(
        `http://localhost:8090/${userrole}/isValidStudent/${id}`,
        "GET",
        {}
      );
      if (isValidRes.output) {
        SuccessToast("Student Exists you wish to edit, go on!!");
        dataChangeHandler("grNo", id);
        setIsValid(true);
      }
    } catch (error) {
      ErrorToast("Student doesnot exists you wish to edit, try again!!");
      setIsValid(false);
      console.log("no student found");
    }
  };

  const submitHandler = async (e, apiUrl) => {
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
    console.log(GradeValidation(Number(data.std)), data.std, Number(data.std));

    if (data.std !== "" && !GradeValidation(Number(data.std))) {
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
        std: Number(data.std),
      };
      for (const [key, value] of Object.entries(payload)) {
        if (
          value !== null &&
          value !== undefined &&
          value !== 0 &&
          value !== NaN
        ) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "PUT", bodyObj);
      Toaster(res);
    } catch (err) {
      ErrorToast(err);
    } finally {
      setInitialData();
      setIsValid(false);
      navigate(`/app/${userrole}/editStudent`);
    }
  };

  const setInitialData = () => {
    setData(initState);
    setIsValid(false);
  };

  return (
    <AllComponentsContainer>
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
          labelText={"Provide Gr NO for student you wish to update data:"}
        ></InputContainerComponent>
        <ButtonElement
          bgcol={"default"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
          onClick={() => searchStudent(data.grNo)}
        >
          Search
        </ButtonElement>
      </ContentContainers>

      <LineBreak />
      {isValid ? (
        <div>
          <HeadingComponent position={"top"}>
            <PageHeading>Only fill the fields you wish to update:</PageHeading>
          </HeadingComponent>
          <ContentContainers
            elements={"multiple"}
            style={{ marginTop: "1rem" }}
          >
            <GridContainer>
              <InputContainerComponent
                value={data.password}
                objKey={"password"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"password"}
                icon={FaKey}
                labelText={"Provide new password:"}
              ></InputContainerComponent>
              <InputContainerComponent
                value={data.name}
                objKey={"name"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"name"}
                icon={FaAddressCard}
                labelText={"Provide new name:"}
              ></InputContainerComponent>
              <InputContainerComponent
                value={data.section}
                objKey={"section"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"section"}
                icon={MdWindow}
                labelText={"Provide new section:"}
              ></InputContainerComponent>
              <InputContainerComponent
                value={data.std}
                objKey={"std"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"std"}
                icon={RiBookShelfLine}
                labelText={"Provide new std:"}
              ></InputContainerComponent>
            </GridContainer>
          </ContentContainers>
          <ContentContainers
            elements={"multiple"}
            style={{ marginTop: "1rem" }}
          >
            <GridLayers style={{ width: "100%" }}>
              <ButtonElement
                style={{ width: "50%" }}
                bgcol={"default"}
                border={"default"}
                textcol={"default"}
                hovercol={"default"}
                type="submit"
                onClick={(e) =>
                  submitHandler(
                    e,
                    `http://localhost:8090/${userrole}/updateStud`
                  )
                }
              >
                Update Student
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
                    navigate(`/app/${userrole}/editStudent`);
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
                  type="reset"
                  onClick={() => setInitialData()}
                >
                  Reset
                </ButtonElement>
              </GridLayers>
            </GridLayers>
          </ContentContainers>
        </div>
      ) : (
        <></>
      )}
    </AllComponentsContainer>
  );
};
