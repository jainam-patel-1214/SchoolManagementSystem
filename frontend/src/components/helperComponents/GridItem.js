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
  flex-direction: row;
  margin-top: 10px;
  justify-content: space-between;
  align-items: center;
`;

export const GridItemComponent = ({
  index,
  grNo,
  password,
  name,
  grade,
  section,
  delete: deleteHandler,
}) => {
  const navigate = useNavigate();
  const userrole = roleExtractor(window.location.pathname);
  return (
    <GridItemBox>
      <ContentContainers elements={"single"} usage={"ingrid"}>
        <IndexComp>{index + 1}</IndexComp>
        <HeaderData>
          <h4>{name}</h4>
          <div>
            {grNo !== "" ? <p>Student ID:&nbsp;{grNo}</p> : <></>}
            {password !== "" ? <p>Password:&nbsp;{password}</p> : <></>}
          </div>
        </HeaderData>
      </ContentContainers>
      <GridLayers>
        <ContentContainers>
          <HeaderData>
            <div>
              <p>GRADE</p>
            </div>
            <h4>{grade}</h4>
          </HeaderData>
        </ContentContainers>
        <ContentContainers>
          <HeaderData>
            <div>
              <p>SECTION</p>
            </div>
            <h4>{section}</h4>
          </HeaderData>
        </ContentContainers>
      </GridLayers>
      <GridLayers>
        <ButtonElement
          style={{ width: "45%" }}
          bgcol={"default"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
        >
          View Details
        </ButtonElement>
        <GridLayers style={{ width: "53%", margin: "0" }}>
          <ButtonElement
            style={{ width: "40%" }}
            bgcol={"transparent"}
            border={"1px solid #b5b5b5af"}
            textcol={"green"}
            hovercol={"#dcfff487"}
            type="button"
            onClick={() => navigate(`/app/teacher/editStudent/${grNo}`)}
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
            onClick={() =>
              deleteHandler(
                `http://localhost:8090/${userrole}/delStudent`,
                Number(grNo)
              )
            }
          >
            Delete
          </ButtonElement>
        </GridLayers>
      </GridLayers>
    </GridItemBox>
  );
};
