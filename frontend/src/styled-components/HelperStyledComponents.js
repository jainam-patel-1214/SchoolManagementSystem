import styled from "styled-components";

export const AllComponentsContainer = styled.div`
  width: 90%;
  margin: auto;
  margin-top: 35px;
  height: 80vh;
  background-color: white;
  overflow-y: scroll;
  &::-webkit-scrollbar {
    display: none;
  }
  scrollbar-width: 0;
`;
export const DisplayViewFormatContainer = styled.div`
  display: block;
  width: fit-content;
  float: right;
  margin-right: 3%;
`;
export const InfoBoxContainer = styled.div`
  display: flex;
  flex-direction: row;
  margin: 15px;
  gap: 15px;
  overflow-x: auto;
  white-space: nowrap;
  padding-bottom: 10px;
`;
export const InfoBox = styled.div`
  flex: 0 0 auto;
  padding: 10px;
  width: 250px;
  margin: 0 15px;
  background-color: black;
  color: white;
  border-radius: 15px;
`;

export const ContentContainers = styled.div`
  padding: ${(props) => (props.usage === "ingrid" ? "0" : "15px")};
  width: ${(props) => (props.usage === "ingrid" ? "100%" : "90%")};
  margin: ${(props) => (props.usage === "ingrid" ? "0" : "auto")};
  background-color: ${(props) =>
    props.usage === "ingrid" ? "#f0e7ff72" : "#fdf2ff72"};
  display: flex;
  border-radius: 10px;
  flex-direction: ${(props) =>
    props.elements === "single" ? "row" : "column"};
  justify-content: ${(props) =>
    props.usage === "ingrid" ? "flex-start" : "space-evenly"};
  /* align-items: ${(props) =>
    props.usage === "ingrid" ? "center" : "flex-start"}; */
  align-items: center;
`;
export const UnderlineComponent = styled.div`
  background-color: #914dffff;
  width: 70%;
  margin: 0;
  height: 2px;
`;
export const HeadingComponent = styled.div`
  h2 {
    font-size: larger;
    margin: 0;
  }
  p.subHeading {
    margin-top: 10px;
    color: grey;
    font-size: small;
  }
  margin: ${(props) => (props.position === "top" ? "15px 15px 0" : "0 15px")};
  padding-left: 15px;
  display: flex;
  flex-direction: column;
  width: fit-content;
`;
export const PageHeading = styled.h2`
  display: block;
  font-weight: 600;
  margin-left: 1.5rem;
`;
export const ButtonElement = styled.button`
  background-color: ${(props) =>
    props.bgcol !== "default" ? props.bgcol : "#6366f1"};
  &:hover {
    background-color: ${(props) =>
      props.hovercol !== "default" ? props.hovercol : "#7678f5ff"};
  }
  color: ${(props) => (props.textcol !== "default" ? props.textcol : "white")};
  cursor: pointer;
  border-radius: 10px;
  width: 100px;
  height: 40px;
  border: ${(props) => (props.border !== "default" ? props.border : "none")};
  padding: 10px;
  margin: 0;
`;
export const GridContainer = styled.div`
  display: grid;
  width: 100%;
  grid-template-columns: repeat(2, 1fr);
  justify-items: stretch;
  align-items: center;
  column-gap: 16px;
  row-gap: 12px;
`;
export const GridItem = styled.div`
  width: 100%;
  padding: 12px;
  box-sizing: border-box;
`;
