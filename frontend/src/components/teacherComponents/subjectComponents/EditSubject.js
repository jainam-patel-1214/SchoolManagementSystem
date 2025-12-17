import { useState, useEffect } from "react";
import {
  GradeValidation,
  GrNoOrSubIdValidation,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { ErrorToast, SuccessToast, Toaster } from "../../../utils/toasterCode";
import { toast, ToastContainer } from "react-toastify";
import { FaOrcid } from "react-icons/fa6";
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
import { useNavigate, useParams } from "react-router-dom";

export const SubEditTabComp = () => {
  const navigate = useNavigate();
  const initState = {
    subjectId: "",
    subjectName: "",
    subjectCredit: null,
    subjectStd: "",
  };
  const [data, setData] = useState(initState);
  const [isValid, setIsValid] = useState(false);
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

    const checkSubject = async () => {
      const isValidRes = await fetchApi(
        `http://localhost:8090/${userrole}/isValidSubject/${id}`,
        "GET",
        {}
      );
      if (isValidRes.output) {
        dataChangeHandler("grNo", id);
        setIsValid(true);
      } else {
        ErrorToast("Student does not exist, try again!");
        setIsValid(false);
      }
    };
    checkSubject();
  }, []);
  const searchSubject = async () => {
    try {
      const isValidRes = await fetchApi(
        `http://localhost:8090/${userrole}/isValidSubject/${data.subjectId}`,
        "GET",
        {}
      );
      if (isValidRes.output) {
        SuccessToast("Subject Exists you wish to edit, go on!!");
        setIsValid(true);
      }
    } catch (error) {
      ErrorToast("Subject doesnot exists you wish to edit, try again!!");
      setIsValid(false);
      console.log("no sub found");
    }
  };

  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();
    if (!GradeValidation(Number(data.subjectStd))) {
      ErrorToast("invalid grade. Allowed range is 1 - 12");
      return;
    }
    if (!GrNoOrSubIdValidation(Number(data.subjectId))) {
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
        if (value !== null && value !== undefined && value !== NaN) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "PUT", bodyObj);
      Toaster(res, toast);
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setInitialData();
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
          Edit subject
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Update the subject's details here |{" "}
          <a href="/app/teacher/displaySubject" style={{ color: "#008cffff" }}>
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
          name={"subid"}
          icon={FaOrcid}
          isRequired={true}
          labelText={"Provide SubId for subject to be updated:"}
        ></InputContainerComponent>

        <ButtonElement
          bgcol={"default"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
          onClick={() => searchSubject()}
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
                value={data.subjectName}
                objKey={"subjectName"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"subname"}
                icon={LuBookA}
                labelText={"Provide subject name:"}
              ></InputContainerComponent>
              <InputContainerComponent
                value={data.subjectCredit}
                objKey={"subjectCredit"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"credits"}
                icon={IoIosRibbon}
                labelText={"Provide new credit:"}
              ></InputContainerComponent>
              <InputContainerComponent
                value={data.subjectStd}
                objKey={"subjectStd"}
                width={"auto"}
                handler={dataChangeHandler}
                name={"subLevel"}
                icon={RiBookShelfLine}
                labelText={"Provide updated grade:"}
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
                    `http://localhost:8090/${userrole}/updateSub`
                  )
                }
              >
                Update Subject
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
                    navigate("/app/teacher/editSubject");
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
