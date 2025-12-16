import { useState } from "react";
import {
  GradeValidation,
  GrNoOrSubIdValidation,
  PasswordValidation,
  StringValidator,
} from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { toast, ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import {
  SearchBoxSection,
  SearchForm,
  SearchOutputSection,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import {
  ButtonContainer,
  InputContainer,
  TeacherInputTabContainer,
} from "../StudentsTab";
import { FaAddressCard, FaCircleUser, FaKey } from "react-icons/fa6";
import { MdWindow } from "react-icons/md";
import { RiBookShelfLine } from "react-icons/ri";
import { StyledButton } from "../../../styled-components/StyledButton";
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
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridItemComponent } from "../../helperComponents/GridItem";
import { useNavigate } from "react-router-dom";

export const StudentEditComponent = () => {
  const [grNo, setGrNo] = useState(0);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const userrole = roleExtractor(window.location.pathname);
  const initState = {
    grNo: "",
    std: "",
    section: "",
    name: "",
    password: "",
  };
  const [data, setData] = useState(initState);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const [displayData, setDisplayData] = useState(null);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(
        `http://localhost:8090/teacher/allStudents`,
        "GET",
        {}
      );
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteStudentHandler = async (apiUrl, grNo) => {
    try {
      if (!GrNoOrSubIdValidation(grNo)) {
        ErrorToast("invalid gr no");
        return;
      }
      let res;
      res = await fetchApi(apiUrl, "DELETE", { grNo: grNo });
      Toaster(res, toast);
      if (res.output) {
        fetchData();
      }
    } catch (err) {
      ErrorToast(err, toast);
    }
  };
  const sumbitHandler = async (e, apiUrl) => {
    e.preventDefault();
    const errobj = {
      grno: { condition: false, message: "invalid gr no" },
      password: {
        condition: false,
        message: "passwords are needed to be 8 digits",
      },
      std: { condition: false, message: "standard shall have range of 1 - 12" },
      name: { condition: false, message: "invalid name" },
      section: { condition: false, message: "invalid section" },
    };
    if (data.password !== "" && !PasswordValidation(data.password)) {
      ErrorToast(errobj.password.message);
      return;
    }
    if (data.grNo !== "" && !GrNoOrSubIdValidation(Number(data.grNo))) {
      ErrorToast(errobj.grno.message);
      return;
    }
    console.log(GradeValidation(Number(data.std)), data.std, Number(data.std));

    if (data.std !== "" && !GradeValidation(Number(data.std))) {
      ErrorToast(errobj.std.message);
      return;
    }
    if (data.name !== "" && !StringValidator(data.name)) {
      ErrorToast(errobj.name.message);
      return;
    }
    if (data.section !== "" && !StringValidator(data.section)) {
      ErrorToast(errobj.section.message);
      return;
    }
    try {
      let res;
      let bodyObj = {};
      const payload = {
        grNo: Number(data.grNo),
        studName: data.name,
        studPwd: data.password,
        section: data.section,
        std: Number(data.std),
      };
      for (const [key, value] of Object.entries(payload)) {
        if (
          value !== null &&
          value !== undefined &&
          value !== 0 &&
          value !== NaN
        ) {
          bodyObj[key] = value;
        }
      }
      res = await fetchApi(apiUrl, "PUT", bodyObj);
      Toaster(res, toast);
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setData(initState);
      e.target.reset();
    }
  };
  return (
    <AllComponentsContainer>
      <HeadingComponent position={"top"}>
        <PageHeading>
          Edit student
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">
          Update the student's details here |{" "}
          <a onClick={() => navigate()}> Go back to veiw student list</a>
        </p>
      </HeadingComponent>

      <ContentContainers elements={"single"} usage={"nongrid"}>
        <InputContainer>
          <FaCircleUser style={{ fontSize: "xx-large" }} />
          <InputWrapper>
            <FloatingInput
              type="text"
              value={grNo || ""}
              name="grNo"
              required
              placeholder=" "
              onChange={(e) => setGrNo(Number(e.target.value))}
            />
            <FloatingLabel>Filter students by Gr NO or name:</FloatingLabel>
          </InputWrapper>
        </InputContainer>
        <ButtonElement
          bgcol={"default"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
        >
          Search
        </ButtonElement>
      </ContentContainers>

      <LineBreak />

      <ContentContainers elements={"single"} usage={"nongrid"}>
        {isLoading ? (
          <div>Fetching all students</div>
        ) : (
          <GridContainer>
            {displayData?.map((value, i) => (
              <GridItemComponent
                key={i}
                index={i}
                grNo={value.grNo}
                password={value.password}
                name={value.studentName}
                grade={value.grade}
                section={value.section}
                delete={deleteStudentHandler}
              ></GridItemComponent>
            ))}
          </GridContainer>
        )}
      </ContentContainers>
    </AllComponentsContainer>
    // <div>
    //   <PageHeading>Edit a student:</PageHeading>
    //   <SearchBoxSection>
    //     <ToastContainer />
    //     <SearchParamSection>
    //       <SearchForm
    //         onSubmit={(e) =>
    //           sumbitHandler(e, `http://localhost:8090/${userrole}/updateStud`)
    //         }
    //       >
    //         <TeacherInputTabContainer>
    //           <InputContainerComponent
    //             value={data.grNo}
    //             objKey={"grNo"}
    //             width={"100%"}
    //             handler={dataChangeHandler}
    //             name={"grno"}
    //             icon={FaCircleUser}
    //             isRequired={true}
    //             labelText={"Provide Gr NO for student you wish to update data:"}
    //           ></InputContainerComponent>
    //         </TeacherInputTabContainer>
    //         <div
    //           style={{
    //             display: "flex",
    //             justifyContent: "center",
    //             alignItems: "center",
    //           }}
    //         >
    //           <h3>Only fill the fields you wish to update data:</h3>
    //         </div>
    //         <TeacherInputTabContainer>
    //           <InputContainerComponent
    //             value={data.password}
    //             objKey={"password"}
    //             width={"50%"}
    //             handler={dataChangeHandler}
    //             name={"password"}
    //             icon={FaKey}
    //             labelText={"Provide new password:"}
    //           ></InputContainerComponent>
    //           <InputContainerComponent
    //             value={data.name}
    //             objKey={"name"}
    //             width={"50%"}
    //             handler={dataChangeHandler}
    //             name={"name"}
    //             icon={FaAddressCard}
    //             labelText={"Provide new name:"}
    //           ></InputContainerComponent>
    //         </TeacherInputTabContainer>
    //         <TeacherInputTabContainer>
    //           <InputContainerComponent
    //             value={data.section}
    //             objKey={"section"}
    //             width={"50%"}
    //             handler={dataChangeHandler}
    //             name={"section"}
    //             icon={MdWindow}
    //             labelText={"Provide new section:"}
    //           ></InputContainerComponent>
    //           <InputContainerComponent
    //             value={data.std}
    //             objKey={"std"}
    //             width={"50%"}
    //             handler={dataChangeHandler}
    //             name={"std"}
    //             icon={RiBookShelfLine}
    //             labelText={"Provide new std:"}
    //           ></InputContainerComponent>
    //         </TeacherInputTabContainer>
    //         <ButtonContainer>
    //           <StyledButton type="submit">Submit</StyledButton>
    //         </ButtonContainer>
    //       </SearchForm>
    //     </SearchParamSection>
    //   </SearchBoxSection>
    //   {displayData !== undefined && displayData !== null ? (
    //     <SearchOutputSection>
    //       {typeof displayData === "string" ? (
    //         <div style={{ padding: "10px" }}>{displayData}</div>
    //       ) : (
    //         <></>
    //       )}
    //     </SearchOutputSection>
    //   ) : (
    //     <></>
    //   )}
    // </div>
  );
};
