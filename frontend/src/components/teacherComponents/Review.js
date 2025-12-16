import {
  SearchBoxSection,
  SearchForm,
  SearchParamSection,
} from "../studentComponents/SchoolResult";
import { toast, ToastContainer } from "react-toastify";
import { StyledButton } from "../../styled-components/StyledButton";
import { useState } from "react";
import { TeacherInputTabContainer } from "./StudentsTab";
import { MdRateReview } from "react-icons/md";
import { FaCircleUser } from "react-icons/fa6";
import { fetchApi } from "../../utils/fetchApiCode";
import { ErrorToast, Toaster } from "../../utils/toasterCode";
import { GrNoOrSubIdValidation } from "../../utils/validations";
import { roleExtractor } from "../../utils/roleExtractor";
import { InputContainerComponent } from "../helperComponents/InputContainer";
import { PageHeading } from "../../styled-components/HelperStyledComponents";

export const ReviewTab = () => {
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    grNo: 0,
    comment: "",
  };
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const sumbitHandler = async (e) => {
    e.preventDefault();
    const errobj = {
      grno: { condition: false, message: "invalid gr no" },
      comment: { condition: false, message: "Please provide a comment to add" },
    };
    if (data?.comment?.length <= 0) {
      ErrorToast(errobj.comment.message);
      return;
    }
    if (!GrNoOrSubIdValidation(data?.grNo)) {
      ErrorToast(errobj.grno.message);
      return;
    }
    try {
      const apiUrl = `http://localhost:8090/${userrole}/addReview`;
      const res = await fetchApi(apiUrl, "POST", {
        grNo: data?.grNo,
        comment: data?.comment,
      });
      Toaster(res, toast);
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setData(initState);
      e.target.reset();
    }
  };

  return (
    <div>
      <PageHeading>Give review to student:</PageHeading>

      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm onSubmit={(e) => sumbitHandler(e)}>
            <TeacherInputTabContainer>
              <InputContainerComponent
                width={"50%"}
                value={data.grNo}
                objKey={"grNo"}
                handler={dataChangeHandler}
                name={"grNo"}
                labelText={"Provide Gr NO. of the student:"}
                icon={FaCircleUser}
                isRequired={true}
              ></InputContainerComponent>
              <InputContainerComponent
                width={"50%"}
                value={data.comment}
                objKey={"comment"}
                handler={dataChangeHandler}
                name={"comment"}
                labelText={"Enter. a review:"}
                icon={MdRateReview}
                isRequired={true}
              ></InputContainerComponent>
            </TeacherInputTabContainer>
            <StyledButton>Submit</StyledButton>
          </SearchForm>
        </SearchParamSection>
      </SearchBoxSection>
    </div>
  );
};
