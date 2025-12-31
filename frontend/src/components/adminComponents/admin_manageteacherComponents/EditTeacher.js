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
import { useParams } from "react-router-dom";
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridLayers } from "../../helperComponents/GridItem";
import { SelectComponent } from "../../helperComponents/SelectComponent";
import { mergeObjects } from "../../../utils/objectsMerger";

export const TeacherEditComponent = () => {
  const userrole = roleExtractor(window.location.pathname);

  const [data, setData] = useState({});
  const originalData = useRef({});
  const subjectList = useRef([]);
  const [searchKey, setSearchKey] = useState("");
  const [showSubjectList, setShowSubjectList] = useState(false);
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const { id } = useParams();
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const setInitialData = () => {
    setData(originalData.current);
    setShowSubjectList(false);
    setSearchKey(
      `${originalData.current.subjectName} (Subject id: ${originalData.current.subjectId})`
    );
  };
  const handleFilterSubject = (e) => {
    const value = e.target.value;
    if (!value) {
      setFilteredSubjects(subjectList.current);
      return;
    }
    const q = value.toLowerCase();
    const rr = subjectList.current.filter(
      (e) => e.value.toString().includes(q) || e.label.toLowerCase().includes(q)
    );
    setFilteredSubjects(rr);
  };
  const fetchSubjects = async () => {
    const tempArr = [];
    try {
      const res = await fetchApi(
        `http://localhost:8090/${userrole}/allSubjects`,
        "GET",
        {}
      );
      if (res.output) {
        res.output.forEach((e) => {
          const tempObj = {};
          tempObj["value"] = e.subjectId;
          tempObj["label"] = e.subjectName;
          tempArr.push(tempObj);
        });
        subjectList.current = tempArr;
        setFilteredSubjects(tempArr);
        return;
      }
    } catch (err) {
      ErrorToast(err);
    }
  };
  const searchTeacher = async (id) => {
    const teacherData = await fetchApi(
      `http://localhost:8090/${userrole}/teacherData/${id}`,
      "GET",
      {}
    );
    if (teacherData.output) {
      const initState = {
        teacherId: "",
        teacherPassword: "",
        subjectId: "",
        teacherName: "",
        sandardAllocated: "",
        sectionAllocated: "",
        subjectName: "",
      };
      subjectList.current.forEach((e) => {
        if (Number(e.value) === teacherData.output.subjectId.Int64) {
          setSearchKey(`${e.label} (Subject id: ${e.value})`);
        }
      });
      initState.teacherId = teacherData.output.teacherId || "";
      initState.teacherPassword = teacherData.output.teacherPwd || "";
      initState.teacherName = teacherData.output.teacherName || "";
      initState.subjectId = teacherData.output.subjectId.Int64 || null;
      initState.sandardAllocated =
        teacherData.output.gradeAllocated.Int64 || null;
      initState.sectionAllocated =
        teacherData.output.sectionAllocated.String || null;
      initState.subjectName =
        teacherData.output.subjectAllocated.String || null;
      setData(initState);
      originalData.current = initState;
    } else {
      ErrorToast("Teacher does not exist, try again!");
      return;
    }
  };
  useEffect(() => {
    fetchSubjects();
    if (!id) return;
    searchTeacher(id);
  }, []);

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
    const keyValueMap = new Map([
      ["teacherId", "teacherId"],
      ["tPwd", "teacherPassword"],
      ["subId", "subjectId"],
      ["tName", "teacherName"],
      ["sectionAllocated", "sectionAllocated"],
      ["stdAllocated", "sandardAllocated"],
    ]);
    const payload = {
      teacherId: Number(data.teacherId),
      tPwd: data.teacherPassword,
      subId: Number(data.subjectId),
      tName: data.teacherName,
      stdAllocated: Number(data.sandardAllocated),
      sectionAllocated: data.sectionAllocated,
    };
    payload["subjectName"] = payload.subId
      ? findSubjectName(payload.subId)
      : originalData.current.subjectName;
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

    if (payload.tPwd !== "" && !PasswordValidation(payload.tPwd)) {
      ErrorToast(errobj.pwd.message);
      return;
    }

    if (payload.tName !== "" && !StringValidator(payload.tName)) {
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
        if (
          value !== null &&
          value !== undefined &&
          originalData.current[keyValueMap.get(key)] !== value
        ) {
          console.log(originalData.current[keyValueMap.get(key)], value);

          bodyObj[key] = value;
        }
      }
      bodyObj["teacherId"] = payload.teacherId;
      console.log(bodyObj, "body of api");

      res = await fetchApi(apiUrl, "PUT", bodyObj);
      Toaster(res);
      console.log(originalData.current, "hello");
      console.log(payload, "pay");
      console.log(subjectList.current, "sl");
      console.log(findSubjectName(payload.subId));

      if (res.output) {
        originalData.current = mergeObjects(
          originalData.current,
          payload,
          keyValueMap
        );
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setInitialData();
      setShowSubjectList(false);
    }
  };

  const findSubjectName = (id) => {
    const subject = subjectList.current.find((item) => item.value === id);

    return subject ? subject.label : "";
  };

  const selectChangeHandler = (e) => {
    const subId = Number(e.target.value);
    let subjectName = "";
    subjectList.current.forEach((item) => {
      if (item.value === subId)
        setSearchKey(`${item.label} (Subject id: ${item.value})`);
    });
    dataChangeHandler("subjectId", e.target.value);
    setShowSubjectList(false);
    return subjectName;
  };

  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Edit teacher
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Update the teacher's details here |{" "}
          <a
            href={`/app/${userrole}/displayTeacher`}
            style={{ color: "#008cffff" }}
          >
            {" "}
            Go back to veiw teacher list
          </a>
        </p>
      </HeadingComponent>
      <LineBreak />
      <HeadingComponent position={"top"}>
        <PageHeading>
          You can change below fields and click update to update teacher's
          values:
        </PageHeading>
      </HeadingComponent>
      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
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
          {!showSubjectList ? (
            <InputContainerComponent
              width={"auto"}
              name={"subname"}
              value={searchKey}
              handler={dataChangeHandler}
              objKey={"subjectId"}
              icon={RiContactsBook2Fill}
              labelText={"Select new subject:"}
              onFocus={() => setShowSubjectList(true)}
              onInput={handleFilterSubject}
              searchKeyHandler={setSearchKey}
            ></InputContainerComponent>
          ) : (
            <SelectComponent
              icon={RiContactsBook2Fill}
              label="Select a subject from dropdown to update"
              value={data.subjectId || ""}
              onChange={selectChangeHandler}
            >
              <option value="">Select subject to update</option>
              {filteredSubjects.map((v) => (
                <option key={v.value} value={v.value}>
                  {`${v.label} (subject's id: ${v.value})`}
                </option>
              ))}
            </SelectComponent>
          )}
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
              submitHandler(e, `http://localhost:8090/${userrole}/editTeacher`)
            }
          >
            Update Teacher
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
