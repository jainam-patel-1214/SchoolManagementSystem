import styled from "styled-components";
import { SearchForm } from "../studentComponents/SchoolResult";
import { RiBookShelfLine } from "react-icons/ri";
import { TiSortAlphabetically } from "react-icons/ti";
import { PendingBtnComp } from "./Home";
import { InputContainerComponent } from "../helperComponents/InputContainer";
import { TeacherInputTabContainer } from "./TeachersTab";
import { ButtonElement } from "../../styled-components/HelperStyledComponents";
import { useEffect, useRef, useState } from "react";
import { fetchApi } from "../../utils/fetchApiCode";

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
const generate8DigitInt = () => {
  console.log("crypto");

  return (crypto.getRandomValues(new Uint32Array(1))[0] % 90000000) + 10000000;
};
export const PopoupComponent = ({
  styleDisplay,
  close,
  isTeacher,
  isStudent,
  submitHandler,
  data,
  newHandler,
}) => {
  const [idNotAvailable, setIdNotAvailable] = useState(false);
  const [idErrorMessage, setIdErrorMessage] = useState("");
  const userList = useRef([]);

  const fetchList = async () => {
    let res;
    try {
      if (isStudent) {
        res = await fetchApi(`/admin/allStudents`, "GET", {});
      }
      if (isTeacher) {
        res = await fetchApi(`/admin/allTeachers`, "GET", {});
      }
      if (!isStudent && !isTeacher) {
        res = await fetchApi(`/admin/allAdmins`, "GET", {});
      }
      if (res.output && typeof res.output !== "string") {
        userList.current = res.output;
        return;
      } else {
        userList.current = [];
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchList();
  }, [isStudent, isTeacher]);

  useEffect(() => {
    let flag = false;
    if (data.id === "") {
      setIdErrorMessage("");
      setIdNotAvailable(false);
      return;
    }
    userList.current.forEach((e) => {
      if (isStudent && e.grNo == data.id) flag = true;
      if (isTeacher && e.teacherId == data.id) flag = true;
      if (!isStudent && !isTeacher && e.adminId == data.id) flag = true;
    });
    setIdNotAvailable(flag);
    if (flag) {
      setIdErrorMessage(`(THIS ID IS ALREADY OCCUPIED)`);
    } else {
      setIdErrorMessage(`ID AVAILABLE`);
    }
  }, [data.id]);

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
            width={"65%"}
            icon={RiBookShelfLine}
            name={"uid"}
            value={data.id || ""}
            handler={newHandler}
            objKey={"id"}
            labelText={
              idErrorMessage ||
              `Provide unique ${
                isStudent ? "student" : isTeacher ? "teacher" : "admin"
              } id:`
            }
            errorColor={idNotAvailable ? "#FF0000" : "default"}
          />
          <ButtonElement
            type="button"
            style={{ width: "30%" }}
            bgcol={"default"}
            border={"default"}
            textcol={"default"}
            hovercol={"#8a8cff"}
            onClick={() => newHandler("id", generate8DigitInt())}
          >
            Generate ramdom ID
          </ButtonElement>
        </TeacherInputTabContainer>
        <TeacherInputTabContainer>
          {isTeacher ? (
            <InputContainerComponent
              width={"100%"}
              icon={TiSortAlphabetically}
              name={"sub"}
              value={data.subjectId || ""}
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
                value={data.std || ""}
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
                value={data.section || ""}
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
        <CloseBtn
          id="closeBtn"
          type="reset"
          onClick={(e) => {
            close(e);
            setIdErrorMessage("");
          }}
        >
          X
        </CloseBtn>
      </SearchForm>
    </DetailsSection>
  );
};
