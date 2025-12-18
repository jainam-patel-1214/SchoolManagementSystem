import { useEffect, useState } from "react";
import {
  GradeValidation,
  GrNoSubIdTeacherIdAdminIdValidation,
  isNotEmptyPair,
  PasswordValidation,
  StringValidator,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ToastContainer } from "react-toastify";
import { ErrorToast, SuccessToast, Toaster } from "../../../utils/toasterCode";
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
import { useNavigate, useParams } from "react-router-dom";
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridLayers } from "../../helperComponents/GridItem";

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
  const navigate = useNavigate();
  const [data, setData] = useState(initState);
  const [isValid, setIsValid] = useState(false);
  const dataChangeHandler = (key, value) => {
    if (key === "teacherId") {
      setIsValid(false);
    }
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const setInitialData = () => {
    setData(initState);
    setIsValid(false);
  };
  const { id } = useParams();
  const checkTeacher = async (id) => {
    const isValidRes = await fetchApi(
      `http://localhost:8090/${userrole}/isValidTeacher/${id}`,
      "GET",
      {}
    );
    if (isValidRes.output) {
      SuccessToast("Teacher valid, go ahead and edit their details");
      dataChangeHandler("teacherId", id);
      setIsValid(true);
    } else {
      ErrorToast("Student does not exist, try again!");
      setIsValid(false);
    }
  };
  useEffect(() => {
    if (!id) return;
    checkTeacher(id);
  }, []);

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
    if (!GrNoSubIdTeacherIdAdminIdValidation(payload.teacherId)) {
      ErrorToast(errobj.tid.message);
      errOccured = true;
    }

    if (
      payload.subId !== 0 &&
      !GrNoSubIdTeacherIdAdminIdValidation(payload.subId)
    ) {
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
      Toaster(res);
    } catch (err) {
      ErrorToast(err);
    } finally {
      if (!errOccured) {
        setInitialData();
      }
    }
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
          width={"100%"}
          name={"tid"}
          value={data.teacherId}
          isRequired={true}
          handler={dataChangeHandler}
          objKey={"teacherId"}
          icon={FaIdCardAlt}
          labelText={"Provide Id for teacher you wish to update data:"}
        ></InputContainerComponent>
        <ButtonElement
          bgcol={"default"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
          onClick={() => checkTeacher(data.teacherId)}
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
                width={"auto"}
                name={"tname"}
                value={data.teacherName}
                handler={dataChangeHandler}
                objKey={"teacherName"}
                icon={FaAddressCard}
                labelText={"Provide new name:"}
              ></InputContainerComponent>
              <InputContainerComponent
                width={"auto"}
                name={"pwd"}
                value={data.teacherPassword}
                handler={dataChangeHandler}
                objKey={"teacherPassword"}
                icon={FaKey}
                labelText={"Provide new password here:"}
              ></InputContainerComponent>
              <InputContainerComponent
                width={"auto"}
                name={"subname"}
                value={data.subjectId}
                handler={dataChangeHandler}
                objKey={"subjectId"}
                icon={RiContactsBook2Fill}
                labelText={"Provide new subject assigned:"}
              ></InputContainerComponent>
              <InputContainerComponent
                width={"auto"}
                name={"std"}
                value={data.sandardAllocated}
                handler={dataChangeHandler}
                objKey={"sandardAllocated"}
                icon={RiBookShelfLine}
                labelText={"Provide new standard assigned:"}
              ></InputContainerComponent>
              <InputContainerComponent
                width={"auto"}
                name={"section"}
                value={data.sectionAllocated}
                handler={dataChangeHandler}
                objKey={"sectionAllocated"}
                icon={MdWindow}
                labelText={"Provide new section assigned:"}
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
                    `http://localhost:8090/${userrole}/editTeacher`
                  )
                }
              >
                Update Teacher
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
                    navigate(`/app/${userrole}/editTeacher`);
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
