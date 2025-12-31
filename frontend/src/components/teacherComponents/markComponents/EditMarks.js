import { useEffect, useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import { FaCircleUser, FaOrcid } from "react-icons/fa6";
import { PiExamFill, PiExamLight } from "react-icons/pi";
import {
  GrNoSubIdTeacherIdAdminIdValidation,
  PracticalMarksValidation,
  TheoryMarksValidation,
} from "../../../utils/validations";
import { fetchApi, fetchUrlParams } from "../../../utils/fetchApiCode";
import { ErrorToast, SuccessToast, Toaster } from "../../../utils/toasterCode";
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

export const EditMarkTab = () => {
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    grNo: "",
    subjectId: "",
    theoryMarks: null,
    practicalMarks: null,
  };
  const subjectList = useRef([]);
  const studentList = useRef([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [showSubjectList, setShowSubjectList] = useState(false);
  const [filteredStudent, setFilteredStudent] = useState([]);
  const [filteredSubject, setFilteredSubject] = useState([]);
  const [isValid, setIsValid] = useState(false);
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    if ((key === "grNo" || key === "subjectId") && data[key] !== value) {
      setIsValid(false);
      dataChangeHandler("theoryMarks", null);
      dataChangeHandler("practicalMarks", null);
    }
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const verifyHandler = async () => {
    if (data.subjectId === "") {
      ErrorToast("Please provide subject id to verify");
      return;
    }
    if (data.grNo === "") {
      ErrorToast("Please provide Gr No. of student to verify");
      return;
    }
    try {
      const [resultForSubject, resultForStudent, markRecordExist] =
        await Promise.all([
          fetchApi(
            `http://localhost:8090/${userrole}/isValidSubject/${data.subjectId}`,
            "GET",
            {}
          ),
          fetchApi(
            `http://localhost:8090/${userrole}/isValidStudent/${data.grNo}`,
            "GET",
            {}
          ),
          fetchApi(
            `http://localhost:8090/${userrole}/isMarkRecordExist?grNo=${data.grNo}&subId=${data.subjectId}`,
            "GET",
            {}
          ),
        ]);
      if (
        resultForSubject.output !== "" &&
        resultForStudent.output !== "" &&
        markRecordExist.output !== ""
      ) {
        setIsValid(true);
        dataChangeHandler("theoryMarks", markRecordExist.output.theoryMarks);
        dataChangeHandler(
          "practicalMarks",
          markRecordExist.output.practicalMarks
        );
        SuccessToast("Record exists, you can edit it successfully");
      }
    } catch (err) {
      ErrorToast(
        "Record doensot exist, please try creating one by clicking second link below"
      );
      console.log(err);
    }
  };

  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    const errobj = {
      grno: { condition: false, message: "invalid gr no" },
      subjectId: { condition: false, message: "invalid sub id" },
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
    if (!GrNoSubIdTeacherIdAdminIdValidation(data.subjectId)) {
      ErrorToast(errobj.subjectId.message);
      return;
    }
    try {
      let res;
      const payload = {
        grNo: Number(data.grNo),
        subId: Number(data.subjectId),
        theoryMarks: Number(data.theoryMarks),
        practicalMarks: Number(data.practicalMarks),
      };
      let bodyObj = {};
      for (const [key, value] of Object.entries(payload)) {
        if (value !== null && value !== undefined && !isNaN(value)) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "PUT", bodyObj);
      Toaster(res);
    } catch (err) {
      ErrorToast(err);
    } finally {
      if ("URLSearchParams" in window) {
        const currentUrl = new URL(window.location.href);
        currentUrl.searchParams.set("tm", data.theoryMarks);
        currentUrl.searchParams.set("pm", data.practicalMarks);
        window.history.pushState({}, "", currentUrl);
      }
    }
  };
  const setInitialData = () => {
    setData(initState);
    setIsValid(false);
  };

  const fetchData = async () => {
    const [resultForStudent, resultForSubject] = await Promise.all([
      fetchApi(`http://localhost:8090/${userrole}/allStudents`, "GET", {}),
      fetchApi(`http://localhost:8090/${userrole}/allSubjects`, "GET", {}),
    ]);
    if (resultForStudent.output) {
      studentList.current = resultForStudent.output;
      setFilteredStudent(resultForStudent.output);
    }
    if (resultForSubject.output) {
      subjectList.current = resultForSubject.output;
      setFilteredSubject(resultForSubject.output);
    }
  };

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

  useEffect(() => {
    fetchData();
    const studentId = fetchUrlParams("grNo");
    const subjectId = fetchUrlParams("subId");
    const theoryMark = fetchUrlParams("tm");
    const practicalMark = fetchUrlParams("pm");
    if (studentId && subjectId) {
      dataChangeHandler("grNo", studentId);
      dataChangeHandler("subjectId", subjectId);
      setIsValid(true);
      if (theoryMark && practicalMark) {
        dataChangeHandler("theoryMarks", theoryMark);
        dataChangeHandler("practicalMarks", practicalMark);
      }
    }
  }, []);

  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Edit student marks
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Update academic performance |{" "}
          <a
            href={`/app/${userrole}/displayStudent`}
            style={{ color: "#008cffff" }}
          >
            {" "}
            View students
          </a>{" "}
          |{" "}
          <a href={`/app/${userrole}/enterMarks`} style={{ color: "#00c200" }}>
            {" "}
            Enter student marks record here
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
            labelText={"Provide sudent's ID/Name:"}
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
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.subjectId}
            objKey={"subjectId"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"subId"}
            icon={FaOrcid}
            labelText={"Provide subject's ID/Name:"}
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
                        dataChangeHandler("subjectId", v.subjectId)
                      }
                    >{`${v.subjectName} (Subject id: ${v.subjectId})`}</DropDownElement>
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
        {isValid ? (
          <></>
        ) : (
          <GridLayers style={{ width: "60%" }}>
            <ButtonElement
              style={{ width: "100%" }}
              bgcol={"default"}
              border={"default"}
              textcol={"default"}
              hovercol={"default"}
              type="submit"
              onClick={() => verifyHandler()}
            >
              Click here first to verify if student and subject record exists
            </ButtonElement>
          </GridLayers>
        )}
      </ContentContainers>

      <LineBreak />
      {isValid ? (
        <div>
          <ContentContainers
            elements={"multiple"}
            style={{ marginTop: "1rem" }}
          >
            <HeadingComponent position={"top"}>
              <PageHeading>{`Student marks for given subject (you can edit them and click below button to proceed):`}</PageHeading>
            </HeadingComponent>
            <GridContainer>
              <InputContainerComponent
                value={data.theoryMarks}
                objKey={"theoryMarks"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"theory"}
                icon={PiExamFill}
                labelText={"Enter theory marks (out of 80):"}
              ></InputContainerComponent>
              <InputContainerComponent
                value={data.practicalMarks}
                objKey={"practicalMarks"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"practical"}
                icon={PiExamLight}
                labelText={"Enter practical marks (out of 20):"}
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
                    `http://localhost:8090/${userrole}/updateMarks`
                  )
                }
              >
                Update Marks
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
        </div>
      ) : (
        <></>
      )}
    </AllComponentsContainer>
  );
};
