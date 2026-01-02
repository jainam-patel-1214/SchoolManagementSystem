import { useEffect, useRef, useState } from "react";
import {
  GradeValidation,
  GrNoSubIdTeacherIdAdminIdValidation,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { ToastContainer } from "react-toastify";
import { FaOrcid } from "react-icons/fa6";
import { RiBookShelfLine } from "react-icons/ri";
import { IoIosRibbon } from "react-icons/io";
import { LuBookA } from "react-icons/lu";
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

export const SubAddTabComp = () => {
  const navigate = useNavigate();
  const userrole = roleExtractor(window.location.pathname);
  const [idErrorMessage, setIdErrorMessage] = useState("");
  const [idNotAvailable, setIdNotAvailable] = useState(false);
  const subjectList = useRef([]);
  const initState = {
    subjectId: "",
    subjectName: "",
    subjectCredit: null,
    subjectStd: "",
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
  const createSubjectHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (
      data.subjectCredit === "" ||
      data.subjectId === "" ||
      data.subjectName === "" ||
      data.subjectStd === "" ||
      data.subjectCredit === null
    ) {
      ErrorToast("Please fill all the fields");
      return;
    }
    if (!GradeValidation(Number(data.subjectStd))) {
      ErrorToast("invalid grade. Allowed range is 1 - 12");
      return;
    }
    if (!GrNoSubIdTeacherIdAdminIdValidation(Number(data.subjectId))) {
      ErrorToast("invalid sub id");
      return;
    }
    if (Number(data.subjectCredit) < 0) {
      ErrorToast("credits cannot be less than 0");
      return;
    }
    try {
      let res;
      let bodyObj = {};
      const payload = {
        subId: Number(data.subjectId),
        subName: data.subjectName,
        credits: Number(data.subjectCredit),
        levelStd: Number(data.subjectStd),
      };
      for (const [key, value] of Object.entries(payload)) {
        if (value !== null && value !== undefined) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "POST", bodyObj);
      Toaster(res);
      if (res.output) {
        fetchSubjects();
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setData(initState);
    }
  };

  const fetchSubjects = async () => {
    try {
      const res = await fetchApi(`/${userrole}/allSubjects`, "GET", {});
      if (res.output && typeof res.output !== "string") {
        subjectList.current = res.output;
        return;
      } else {
        subjectList.current = [];
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSubjects();
  }, []);

  useEffect(() => {
    let flag = false;
    if (data.subjectId === "") {
      setIdErrorMessage("");
      setIdNotAvailable(false);
      return;
    }
    subjectList.current.forEach((e) => {
      if (e.subjectId == data.subjectId) flag = true;
    });
    setIdNotAvailable(flag);
    if (flag) {
      setIdErrorMessage(`(THIS ID IS ALREADY OCCUPIED)`);
    } else {
      setIdErrorMessage(`ID AVAILABLE`);
    }
  }, [data.subjectId]);

  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          New Subject Addition
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Create a subject which would be considered from now |{" "}
          <a
            href={`/app/${userrole}/displaySubject`}
            style={{ color: "#008cffff" }}
          >
            {" "}
            Go back to veiw subject list
          </a>
        </p>
      </HeadingComponent>

      <ContentContainers elements={"single"} usage={"nongrid"}>
        <InputContainerComponent
          value={data.subjectId}
          objKey={"subjectId"}
          width={"100%"}
          handler={dataChangeHandler}
          name={"subId"}
          icon={FaOrcid}
          labelText={
            idErrorMessage ||
            "Provide unique ID for subject you wish to create:"
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
            value={data.subjectName}
            objKey={"subjectName"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"subName"}
            icon={LuBookA}
            labelText={"Assign name to subject:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.subjectStd}
            objKey={"subjectStd"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"grade"}
            icon={RiBookShelfLine}
            labelText={"Provide subject's level:"}
          ></InputContainerComponent>
          <InputContainerComponent
            value={data.subjectCredit || ""}
            objKey={"subjectCredit"}
            width={"auto"}
            handler={dataChangeHandler}
            name={"credits"}
            icon={IoIosRibbon}
            labelText={"Assign subject's credits:"}
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
            onClick={(e) => createSubjectHandler(e, `/${userrole}/createSub`)}
          >
            Create Subject
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
                navigate(`/app/${userrole}/displaySubject`);
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
