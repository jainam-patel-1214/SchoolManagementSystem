import { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import { FaCircleUser, FaOrcid } from "react-icons/fa6";
import { PiExamFill, PiExamLight } from "react-icons/pi";
import {
  GrNoSubIdTeacherIdAdminIdValidation,
  PracticalMarksValidation,
  TheoryMarksValidation,
} from "../../../utils/validations";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { fetchApi, fetchUrlParams } from "../../../utils/fetchApiCode";
import { roleExtractor } from "../../../utils/roleExtractor";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  GridContainer,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../../styled-components/HelperStyledComponents";
import { InputContainerComponent } from "../../helperComponents/InputContainer";
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridLayers } from "../../helperComponents/GridItem";
import {
  DropDownContainer,
  DropDownElement,
} from "../../../styled-components/Dropdown";

export const AddMarkTab = () => {
  const userrole = roleExtractor(window.location.pathname);
  const subjectList = useRef([]);
  const studentList = useRef([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [showSubjectList, setShowSubjectList] = useState(false);
  const [filteredStudent, setFilteredStudent] = useState([]);
  const [filteredSubject, setFilteredSubject] = useState([]);
  const initState = {
    grNo: "",
    subId: "",
    theoryMarks: null,
    practicalMarks: null,
  };
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (
      data.grNo === "" ||
      data.practicalMarks === "" ||
      data.theoryMarks === "" ||
      data.subId === "" ||
      data.theoryMarks === null ||
      data.practicalMarks === null
    ) {
      ErrorToast("Please fill all the values above");
      return;
    }
    const errobj = {
      grno: { condition: false, message: "invalid gr no" },
      subid: { condition: false, message: "invalid sub id" },
      theory: {
        condition: false,
        message: "theory marks range shall be from 0 to 80",
      },
      practical: {
        condition: false,
        message: "practical marks range shall be from 0 to 20",
      },
    };
    if (!TheoryMarksValidation(data.theoryMarks)) {
      ErrorToast(errobj.theory.message);
      return;
    }
    if (!PracticalMarksValidation(data.practicalMarks)) {
      ErrorToast(errobj.practical.message);
      return;
    }
    if (!GrNoSubIdTeacherIdAdminIdValidation(data.grNo)) {
      ErrorToast(errobj.grno.message);
      return;
    }
    if (!GrNoSubIdTeacherIdAdminIdValidation(data.subId)) {
      ErrorToast(errobj.subid.message);
      return;
    }
    try {
      let res;
      const payload = {
        grNo: Number(data.grNo),
        subId: Number(data.subId),
        theoryMarks: Number(data.theoryMarks),
        practicalMarks: Number(data.practicalMarks),
      };
      let bodyObj = {};
      for (const [key, value] of Object.entries(payload)) {
        if (value !== null && value !== undefined) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "POST", bodyObj);
      Toaster(res);
    } catch (err) {
      ErrorToast(err);
    } finally {
      setData((prev) => ({
        ...prev,
        grNo: data.grNo,
      }));
    }
  };
  const setInitialData = () => {
    setData(initState);
  };
  const fetchData = async () => {
    const [resultForStudent, resultForSubject] = await Promise.all([
      fetchApi(`/${userrole}/allStudents`, "GET", {}),
      fetchApi(`/${userrole}/allSubjects`, "GET", {}),
    ]);
    if (
      resultForStudent.output &&
      typeof resultForStudent.output !== "string"
    ) {
      studentList.current = resultForStudent.output;
      setFilteredStudent(resultForStudent.output);
    }
    if (
      resultForSubject.output &&
      typeof resultForSubject.output !== "string"
    ) {
      subjectList.current = resultForSubject.output;
      setFilteredSubject(resultForSubject.output);
    }
  };
  useEffect(() => {
    fetchData();
    const studentId = fetchUrlParams("grNo");
    if (studentId) {
      dataChangeHandler("grNo", studentId);
    }
  }, []);

  const handleFilterStudentAndSubject = (e, data, setter, type) => {
    const value = e.target.value;
    if (!value) {
      setter(data);
      return;
    }
    const q = value.toLowerCase();
    let rr;
    if (type === "subject") {
      rr = data.filter(
        (elem) =>
          elem.subjectId.toString().includes(q) ||
          elem.subjectName.toLowerCase().includes(q)
      );
    }
    if (type === "student") {
      rr = data.filter(
        (elem) =>
          elem.grNo.toString().includes(q) ||
          elem.studentName.toLowerCase().includes(q)
      );
    }
    setter(rr);
  };

  return (
    <AllComponentsContainer className="parent-container">
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Enter new marks record
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Add academic performance record for students |{" "}
          <a
            href={`/app/${userrole}/displayStudent`}
            style={{ color: "#008cffff" }}
          >
            {" "}
            View students
          </a>{" "}
          |{" "}
          <a href={`/app/${userrole}/editMarks`} style={{ color: "#00c200" }}>
            {" "}
            Update student marks record here
          </a>
        </p>
      </HeadingComponent>

      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <HeadingComponent position={"top"}>
          <PageHeading>Student & Subject information:</PageHeading>
        </HeadingComponent>
        <GridContainer>
          <InputContainerComponent
            value={data.grNo}
            objKey={"grNo"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"grNo"}
            icon={FaCircleUser}
            onFocus={() => setShowStudentList(true)}
            onBlur={() => setShowStudentList(false)}
            onInput={(e) =>
              handleFilterStudentAndSubject(
                e,
                studentList.current,
                setFilteredStudent,
                "student"
              )
            }
            labelText={"Provide student's ID/Name:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.subId}
            objKey={"subId"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"subId"}
            icon={FaOrcid}
            onFocus={() => setShowSubjectList(true)}
            onBlur={() => setShowSubjectList(false)}
            onInput={(e) =>
              handleFilterStudentAndSubject(
                e,
                subjectList.current,
                setFilteredSubject,
                "subject"
              )
            }
            labelText={"Provide subject's ID/Name:"}
          ></InputContainerComponent>
        </GridContainer>
        {showStudentList || showSubjectList ? (
          <GridContainer>
            {showStudentList ? (
              <DropDownContainer>
                {filteredStudent.map((v, i) => {
                  return (
                    <DropDownElement
                      key={i}
                      onMouseDown={() => dataChangeHandler("grNo", v.grNo)}
                    >{`${v.studentName} (GrNo: ${v.grNo})`}</DropDownElement>
                  );
                })}
              </DropDownContainer>
            ) : (
              <div></div>
            )}
            {showSubjectList ? (
              <DropDownContainer>
                {filteredSubject.map((v, i) => {
                  return (
                    <DropDownElement
                      key={i}
                      onMouseDown={() =>
                        dataChangeHandler("subId", v.subjectId)
                      }
                    >{`${v.subjectName} (subject id: ${v.subjectId})`}</DropDownElement>
                  );
                })}
              </DropDownContainer>
            ) : (
              <></>
            )}
          </GridContainer>
        ) : (
          <></>
        )}
      </ContentContainers>

      <LineBreak />

      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <HeadingComponent position={"top"}>
          <PageHeading>Give student score details he/she scored:</PageHeading>
        </HeadingComponent>
        <GridContainer>
          <InputContainerComponent
            value={data.theoryMarks || ""}
            objKey={"theoryMarks"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"theory"}
            icon={PiExamFill}
            labelText={"Enter theory marks (out of 80):"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.practicalMarks || ""}
            objKey={"practicalMarks"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"practical"}
            icon={PiExamLight}
            labelText={"Enter practical marks (out of 20):"}
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
            onClick={(e) => submitHandler(e, `/${userrole}/enterMarks`)}
          >
            Submit Marks
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
