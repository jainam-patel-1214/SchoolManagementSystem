import { toast, ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import { TeacherAdminIdValid } from "../../../utils/validations";
import { useState } from "react";
import {
  SearchBoxSection,
  SearchForm,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import { TeacherInputTabContainer } from "../TeachersTab";
import {
  ButtonContainer,
  InputContainer,
} from "../../teacherComponents/StudentsTab";
import { GiTeacher } from "react-icons/gi";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import { StyledButton } from "../../../styled-components/StyledButton";
import { ReactTableComponent } from "../../helperComponents/ResultTable";
import { fetchApi } from "../../../utils/fetchApiCode";
import { roleExtractor } from "../../../utils/roleExtractor";
import { PageHeading } from "../../../styled-components/HelperStyledComponents";

export const DisplayTeacherPerformanceComponent = () => {
  const userrole = roleExtractor(window.location.pathname);
  const [teacherId, setTeacherId] = useState(0);
  const [displayData, setDisplayData] = useState(null);

  const submitHandler = async (e, apiUrl) => {
    e.preventDefault();

    if (!TeacherAdminIdValid(teacherId)) {
      ErrorToast("invalid teacher id");
      return;
    }
    try {
      let res;
      res = await fetchApi(apiUrl, "GET", {});
      Toaster(res);
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setTeacherId(null);
      e.target.reset();
    }
  };

  const columnDef = [
    {
      header: "Teacher Id",
      accessorKey: "Tid",
    },
    {
      header: "Teacher Name",
      accessorKey: "TName",
    },
    {
      header: "Standard Allocated",
      accessorKey: "StdAllocated",
    },
    {
      header: "Subject Allocated",
      accessorKey: "SubName",
    },
    {
      header: "Total Practical Marks",
      accessorKey: "TotalPracticalMarks",
    },
    {
      header: "Total Theory Marks",
      accessorKey: "TotalTheoryMarks",
    },
  ];
  return (
    <div>
      <PageHeading>Edit a teacher:</PageHeading>
      <SearchBoxSection>
        <ToastContainer />
        <SearchParamSection>
          <SearchForm
            onSubmit={(e) => {
              submitHandler(
                e,
                `http://localhost:8090/${userrole}/displayTeacherPerformance/${teacherId}`
              );
            }}
          >
            <TeacherInputTabContainer>
              <InputContainer>
                <GiTeacher style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                  <FloatingInput
                    type="text"
                    value={teacherId || ""}
                    name="teacherid"
                    placeholder=" "
                    maxLength={8}
                    onChange={(e) => {
                      setTeacherId(Number(e.target.value));
                    }}
                  />
                  <FloatingLabel>
                    Provide id of teacher you wish to look performance:
                  </FloatingLabel>
                </InputWrapper>
              </InputContainer>
            </TeacherInputTabContainer>
            <ButtonContainer>
              <StyledButton type="submit">Submit</StyledButton>
            </ButtonContainer>
          </SearchForm>
        </SearchParamSection>
      </SearchBoxSection>
      {typeof displayData !== "string" &&
      displayData?.length > 0 &&
      displayData !== undefined &&
      displayData !== null ? (
        <ReactTableComponent
          data={displayData}
          columnDefinition={columnDef}
          heading={"Performance among teacher's peers"}
        />
      ) : (
        <>{displayData}</>
      )}
    </div>
  );
};
