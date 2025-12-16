import styled from "styled-components";
import { SearchForm } from "../studentComponents/SchoolResult";
import { RiBookShelfLine } from "react-icons/ri";
import { TiSortAlphabetically } from "react-icons/ti";
import { PendingBtnComp } from "./Home";
import { InputContainerComponent } from "../helperComponents/InputContainer";
import { TeacherInputTabContainer } from "./TeachersTab";

const DetailsSection = styled.div`
  display: none;
  position: fixed;
  top: 50%;
  left: 50%;
  width: 65%;
  transform: translate(-50%, -50%);
  padding: 1rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.3);
  display: ${(props) => (props.styleDisplay ? "flex" : "none")};
  z-index: 10;
`;
const CloseBtn = styled.button`
  position: absolute;
  background-color: red;
  top: 8px;
  right: 8px;
  padding: 5px 10px;
  &:hover {
    background-color: ${(props) =>
      props.variant === "accept" ? "#15d200ff" : "#ff4f4fff"};
    cursor: pointer;
  }
`;
export const PopoupComponent = ({
  styleDisplay,
  close,
  isTeacher,
  isStudent,
  submitHandler,
  data,
  newHandler,
}) => {
  return (
    <DetailsSection styleDisplay={styleDisplay}>
      <SearchForm
        onSubmit={(e) => {
          submitHandler(e);
        }}
        style={{ width: "100%" }}
      >
        <TeacherInputTabContainer>
          <InputContainerComponent
            width={"100%"}
            icon={RiBookShelfLine}
            name={"uid"}
            value={data.id}
            handler={newHandler}
            objKey={"id"}
            labelText={`Provide unique ${
              isStudent ? "student" : isTeacher ? "teacher" : "admin"
            } id:`}
          />
        </TeacherInputTabContainer>
        <TeacherInputTabContainer>
          {isTeacher ? (
            <InputContainerComponent
              width={"100%"}
              icon={TiSortAlphabetically}
              name={"sub"}
              value={data.subjectId}
              handler={newHandler}
              objKey={"subjectId"}
              labelText={`Provide sub id if teacher is assigned one:`}
            />
          ) : (
            <></>
          )}
        </TeacherInputTabContainer>
        {isStudent || isTeacher ? (
          <>
            <TeacherInputTabContainer>
              <InputContainerComponent
                width={"100%"}
                icon={TiSortAlphabetically}
                name={"std"}
                value={data.std}
                handler={newHandler}
                objKey={"std"}
                labelText={`Provide standard:`}
              />
            </TeacherInputTabContainer>
            <TeacherInputTabContainer>
              <InputContainerComponent
                width={"100%"}
                icon={TiSortAlphabetically}
                name={"section"}
                value={data.section}
                handler={newHandler}
                objKey={"section"}
                labelText={`Provide section:`}
              />
            </TeacherInputTabContainer>
          </>
        ) : (
          <></>
        )}
        <PendingBtnComp type="submit" variant={"accept"}>
          Submit
        </PendingBtnComp>
        <CloseBtn id="closeBtn" type="reset" onClick={(e) => close(e)}>
          X
        </CloseBtn>
      </SearchForm>
    </DetailsSection>
  );
};
