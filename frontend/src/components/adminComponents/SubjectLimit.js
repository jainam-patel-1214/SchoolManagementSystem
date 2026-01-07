import { ToastContainer } from "react-toastify";
import { useState } from "react";
import { RiBookShelfLine } from "react-icons/ri";
import { GiBookPile } from "react-icons/gi";
import { ErrorToast, Toaster } from "../../utils/toasterCode";
import { fetchApi } from "../../utils/fetchApiCode";
import { roleExtractor } from "../../utils/roleExtractor";
import { GradeValidation } from "../../utils/validations";
import { InputContainerComponent } from "../helperComponents/InputContainer";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  GridContainer,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../styled-components/HelperStyledComponents";
import { GridLayers } from "../helperComponents/GridItem";

export const SubjectLimit = () => {
  const [data, setData] = useState({ grade: "", limit: "" });
  const userrole = roleExtractor(window.location.pathname);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };

  const setSubjectLimit = async (e) => {
    e.preventDefault();
    if (!GradeValidation(Number(data.grade)) || data.grade === "") {
      ErrorToast("invalid grade given. It shall be between 1-12");
      return;
    }
    if (Number(data.limit) < 0 || data.limit === "") {
      ErrorToast("negative limit not allowed");
      return;
    }

    try {
      const payload = { std: Number(data.grade), limit: Number(data.limit) };
      const res = await fetchApi(`/${userrole}/setSubLimit`, "POST", payload);
      Toaster(res);
    } catch (error) {
      ErrorToast(error);
    } finally {
      setData({ grade: "", limit: "" });
    }
  };
  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Set Subject Limit
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Provide limit on how much subjects shall be taught corresponding to
          each grade |{" "}
          <a
            href={`/app/${userrole}/displaySubject`}
            style={{ color: "#008cffff" }}
          >
            {" "}
            Go back to veiw subject list
          </a>
        </p>
      </HeadingComponent>

      <HeadingComponent position={"top"}>
        <PageHeading>
          Provide standard and it's corresponding limit:
        </PageHeading>
      </HeadingComponent>
      <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
        <HeadingComponent position={"bottom"}>
          <p className="subHeading" style={{ color: "red" }}>
            <strong>Note:</strong> Once limit set, it cant be changed
          </p>
        </HeadingComponent>
        <GridContainer>
          <InputContainerComponent
            width={"auto"}
            icon={RiBookShelfLine}
            name={"std"}
            handler={dataChangeHandler}
            objKey={"grade"}
            labelText={"Provide grade of class you wish to set limit:"}
            value={data.grade}
          ></InputContainerComponent>
          <InputContainerComponent
            width={"auto"}
            icon={GiBookPile}
            name={"limit"}
            handler={dataChangeHandler}
            objKey={"limit"}
            labelText={"Provide limit of subjects for this standard:"}
            value={data.limit}
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
            onClick={(e) => setSubjectLimit(e)}
          >
            Set Limit
          </ButtonElement>
          <ButtonElement
            style={{ width: "48%" }}
            bgcol={"transparent"}
            border={"1px solid #b5b5b5af"}
            textcol={"red"}
            hovercol={"#ffd3d3af"}
            type="reset"
            onClick={() => setData({ grade: 0, limit: 0 })}
          >
            Reset
          </ButtonElement>
        </GridLayers>
      </ContentContainers>
    </AllComponentsContainer>
  );
};
