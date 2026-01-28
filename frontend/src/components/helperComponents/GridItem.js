import styled from "styled-components";
import {
  ButtonElement,
  ContentContainers,
} from "../../styled-components/HelperStyledComponents";
import { roleExtractor } from "../../utils/roleExtractor";
import { useNavigate } from "react-router-dom";

export const IndexComp = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #914dff;
  color: white;
  margin: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 600;
`;
export const HeaderData = styled.div`
  display: flex;
  width: 80%;
  flex-direction: column;
  h4 {
    margin: 0;
  }
  div {
    flex-direction: row;
    display: flex;
    width: 100%;
  }
  div p {
    margin: 0 15px 0 0;
    font-size: smaller;
    color: grey;
  }
`;
export const GridItemBox = styled.div`
  display: flex;
  height: fit-content;
  padding: 10px;
  flex-direction: column;
  background-color: white;
  border-radius: 10px;
  border: 1px solid #b5b5b5af;
`;
export const GridLayers = styled.div`
  display: flex;
  width: 100%;
  flex-direction: row;
  margin-top: 10px;
  justify-content: space-between;
  align-items: center;
`;

export const GridItemComponent = ({
  index,
  objectId,
  password,
  name,
  grade,
  section,
  credits,
  isStudent,
  subjectName,
  isTeacher,
  delete: deleteHandler,
  variant,
}) => {
  const navigate = useNavigate();
  const userrole = roleExtractor(window.location.pathname);
  return (
    <GridItemBox className="gridListContainer">
      <ContentContainers
        className="gridListHeading"
        elements={"single"}
        usage={"ingrid"}
      >
        <IndexComp>{index + 1}</IndexComp>
        <HeaderData>
          <h4>{name}</h4>
          {isTeacher && objectId !== "" ? (
            <div>
              <p>Teacher ID:&nbsp;{objectId}</p>
              <p>Password:&nbsp;{password}</p>
            </div>
          ) : (
            <div>
              {objectId !== "" ? (
                <p>
                  {isStudent ? "Student ID:" : "Subject ID:"}&nbsp;{objectId}
                </p>
              ) : (
                <></>
              )}
              {isStudent ? <p>Password:&nbsp;{password}</p> : <></>}
            </div>
          )}
        </HeaderData>
      </ContentContainers>
      {isTeacher ? (
        <GridLayers className="gridListDescription">
          <ContentContainers>
            <HeaderData>
              <div>
                <p>Class allocated:</p>
              </div>
              <h4>{grade + section}</h4>
            </HeaderData>
          </ContentContainers>
          <ContentContainers>
            <HeaderData>
              <div>
                <p>Subject appointed:</p>
              </div>
              <h4>{subjectName}</h4>
            </HeaderData>
          </ContentContainers>
        </GridLayers>
      ) : (
        <GridLayers className="gridListDescription">
          <ContentContainers>
            <HeaderData>
              <div>
                <p>GRADE</p>
              </div>
              <h4>{grade}</h4>
            </HeaderData>
          </ContentContainers>
          {isStudent ? (
            <ContentContainers>
              <HeaderData>
                <div>
                  <p>SECTION</p>
                </div>
                <h4>{section}</h4>
              </HeaderData>
            </ContentContainers>
          ) : (
            <ContentContainers>
              <HeaderData>
                <div>
                  <p>CREDITS</p>
                </div>
                <h4>{credits}</h4>
              </HeaderData>
            </ContentContainers>
          )}
        </GridLayers>
      )}
      <GridLayers className="gridListActions">
        {variant !== "subject" ? (
          <ButtonElement
            className="performanceButton"
            style={{ width: "45%" }}
            bgcol={"default"}
            border={"default"}
            textcol={"default"}
            hovercol={"default"}
            onClick={() => {
              isStudent
                ? navigate(
                    `/app/${userrole}/studentPerformance?` +
                      new URLSearchParams({
                        name: name,
                        std: grade,
                        section: section,
                        grNo: objectId,
                      })
                  )
                : navigate(
                    `/app/${userrole}/displayTeacherPerformance?` +
                      new URLSearchParams({
                        name: name,
                        std: grade,
                        section: section,
                        subject: subjectName,
                        tid: objectId,
                      })
                  );
            }}
          >
            View Performance
          </ButtonElement>
        ) : (
          <></>
        )}
        <GridLayers
          className="editDelActionButtons"
          style={{ width: "53%", margin: "0" }}
        >
          <ButtonElement
            style={{ width: "40%" }}
            bgcol={"transparent"}
            border={"1px solid #b5b5b5af"}
            textcol={"green"}
            hovercol={"#dcfff487"}
            type="button"
            onClick={() => {
              isTeacher
                ? navigate(`/app/${userrole}/editTeacher/${objectId}`)
                : isStudent
                ? navigate(`/app/${userrole}/editStudent/${objectId}`)
                : navigate(`/app/${userrole}/editSubject/${objectId}`);
            }}
          >
            Edit
          </ButtonElement>
          <ButtonElement
            style={{ width: "55%" }}
            bgcol={"transparent"}
            border={"1px solid #b5b5b5af"}
            textcol={"red"}
            hovercol={"#ffd3d3af"}
            type="button"
            onClick={() => {
              isTeacher
                ? deleteHandler(`/${userrole}/delTeacher`, Number(objectId))
                : isStudent
                ? deleteHandler(`/${userrole}/delStudent`, Number(objectId))
                : deleteHandler(`/${userrole}/delSubject`, Number(objectId));
            }}
          >
            Delete
          </ButtonElement>
        </GridLayers>
      </GridLayers>
    </GridItemBox>
  );
};
