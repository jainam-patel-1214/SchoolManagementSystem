import { useState } from "react";
import { MdRateReview } from "react-icons/md";
import { FaCircleUser } from "react-icons/fa6";
import { fetchApi } from "../../utils/fetchApiCode";
import { ErrorToast, SuccessToast, Toaster } from "../../utils/toasterCode";
import { GrNoSubIdTeacherIdAdminIdValidation } from "../../utils/validations";
import { roleExtractor } from "../../utils/roleExtractor";
import { InputContainerComponent } from "../helperComponents/InputContainer";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../styled-components/HelperStyledComponents";
import { LineBreak } from "../../styled-components/LineBreak";
import { GridLayers } from "../helperComponents/GridItem";
import { ToastContainer } from "react-toastify";

export const ReviewTab = () => {
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    grNo: "",
    comment: "",
  };
  const [data, setData] = useState(initState);
  const [isValid, setIsValid] = useState(false);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    if (data.comment.length <= 8 || data.comment.length > 255) {
      ErrorToast(
        "Please provide a comment within minimum 8 to maximum 250 characters"
      );
      return;
    }
    try {
      const apiUrl = `/${userrole}/addReview`;
      const res = await fetchApi(apiUrl, "POST", {
        grNo: Number(data.grNo),
        comment: data.comment,
      });
      Toaster(res);
    } catch (err) {
      ErrorToast(err);
    } finally {
      setInitialData();
    }
  };

  const searchStudent = async () => {
    if (!GrNoSubIdTeacherIdAdminIdValidation(data?.grNo)) {
      ErrorToast("invalid gr no");
      return;
    }
    try {
      const isValidRes = await fetchApi(
        `/${userrole}/isValidStudent/${data.grNo}`,
        "GET",
        {}
      );
      if (isValidRes.output) {
        SuccessToast("Student Exists you wish to give review, go on!!");
        setIsValid(true);
      }
    } catch (error) {
      ErrorToast("Student doesnot exists you wish to edit, try again!!");
      setIsValid(false);
      console.log("no student found");
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
          Add review
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <ContentContainers elements={"single"} usage={"nongrid"}>
        <InputContainerComponent
          value={data.grNo}
          objKey={"grNo"}
          width={"100%"}
          handler={dataChangeHandler}
          name={"grNo"}
          icon={FaCircleUser}
          labelText={"Provide Gr NO for student you wish to give review:"}
        ></InputContainerComponent>
        <ButtonElement
          bgcol={"default"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
          onClick={() => searchStudent()}
        >
          Search
        </ButtonElement>
      </ContentContainers>
      <LineBreak />
      {isValid ? (
        <div>
          <HeadingComponent position={"top"}>
            <PageHeading>Provide a review which fits best:</PageHeading>
          </HeadingComponent>
          <HeadingComponent position={"bottom"}>
            <p className="subHeading" style={{ color: "red" }}>
              <strong>Note: </strong> You can only add one review per student
            </p>
          </HeadingComponent>
          <ContentContainers elements={"single"} usage={"nongrid"}>
            <InputContainerComponent
              width={"100%"}
              value={data.comment}
              objKey={"comment"}
              handler={dataChangeHandler}
              name={"comment"}
              labelText={"Enter a review (250 characters max):"}
              icon={MdRateReview}
            ></InputContainerComponent>
          </ContentContainers>
          <ContentContainers
            elements={"multiple"}
            style={{ marginTop: "1rem" }}
          >
            <GridLayers style={{ width: "100%" }}>
              <ButtonElement
                style={{ width: "48%" }}
                bgcol={"default"}
                border={"default"}
                textcol={"default"}
                hovercol={"default"}
                type="submit"
                onClick={(e) => submitHandler(e)}
              >
                Add Review
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
                Clear Fields
              </ButtonElement>
            </GridLayers>
          </ContentContainers>
        </div>
      ) : (
        <></>
      )}
    </AllComponentsContainer>
  );
};
