import { useState, useEffect, useRef } from "react";
import {
  GradeValidation,
  GrNoSubIdTeacherIdAdminIdValidation,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, SuccessToast, Toaster } from "../../../utils/toasterCode";
import { ToastContainer } from "react-toastify";
import { RiBookShelfLine } from "react-icons/ri";
import { IoIosRibbon } from "react-icons/io";
import { LuBookA } from "react-icons/lu";
import { roleExtractor } from "../../../utils/roleExtractor";
import { InputContainerComponent } from "../../helperComponents/InputContainer";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  GridContainer,
  HeadingComponent,
  UnderlineComponent,
} from "../../../styled-components/HelperStyledComponents";
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridLayers } from "../../helperComponents/GridItem";
import { useParams } from "react-router-dom";

export const SubEditTabComp = () => {
  const [data, setData] = useState({});
  const originalData = useRef({});
  const userrole = roleExtractor(window.location.pathname);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const { id } = useParams();
  useEffect(() => {
    if (!id) return;
    searchSubject(id);
  }, []);
  const searchSubject = async (id) => {
    try {
      const subjectData = await fetchApi(
        `/${userrole}/subjectData/${id}`,
        "GET",
        {}
      );
      if (subjectData.output && typeof subjectData.output !== "string") {
        const initState = {
          subjectId: "",
          subjectName: "",
          subjectCredit: null,
          subjectStd: "",
        };
        initState.subjectId = subjectData.output.subId || "";
        initState.subjectName = subjectData.output.sujectName || "";
        initState.subjectStd = subjectData.output.levelStd || "";
        initState.subjectCredit = subjectData.output.credits || null;
        setData(initState);
        originalData.current = initState;
      }
    } catch (error) {
      ErrorToast("Subject doesnot exists you wish to edit, try again!!");
      console.log("no sub found");
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
      res = await fetchApi(apiUrl, "PUT", bodyObj);
      Toaster(res);
      if (res.output) {
        originalData.current = { ...data };
      }
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
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Edit subject
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Update the subject's details here |{" "}
          <a
            href={`/app/${userrole}/displaySubject`}
            style={{ color: "#008cffff" }}
          >
            {" "}
            Go back to veiw subject list
          </a>
        </p>
      </HeadingComponent>
      <LineBreak />
      <div>
        <HeadingComponent position={"top"}>
          <PageHeading>
            You can change below fields and click update to update the values:
          </PageHeading>
        </HeadingComponent>
        <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
          <GridContainer>
            <InputContainerComponent
              value={data.subjectName || ""}
              objKey={"subjectName"}
              width={"auto"}
              handler={dataChangeHandler}
              name={"subname"}
              icon={LuBookA}
              labelText={"Provide subject name:"}
            ></InputContainerComponent>
            <InputContainerComponent
              value={data.subjectCredit || ""}
              objKey={"subjectCredit"}
              width={"auto"}
              handler={dataChangeHandler}
              name={"credits"}
              icon={IoIosRibbon}
              labelText={"Provide new credit:"}
            ></InputContainerComponent>
            <InputContainerComponent
              value={data.subjectStd || ""}
              objKey={"subjectStd"}
              width={"auto"}
              handler={dataChangeHandler}
              name={"subLevel"}
              icon={RiBookShelfLine}
              labelText={"Provide updated grade:"}
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
              onClick={(e) => submitHandler(e, `/${userrole}/updateSub`)}
            >
              Update Subject
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
    </AllComponentsContainer>
  );
};
