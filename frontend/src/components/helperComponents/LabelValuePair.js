import styled from "styled-components";

export const LabelValue = styled.div`
  display: flex;
  flex-direction: column;
  width: ${({ infobox, width }) => (infobox ? width : "100%")};
  background-color: ${({ infobox }) => (infobox ? "#e0d0ff85" : "transparent")};
  padding: ${({ infobox }) => (infobox ? "15px" : "0")};
  border: none;
  border-radius: ${({ infobox }) => (infobox ? "15px" : "0")};
  color: ${({ infobox }) => (infobox ? "#bd80f3" : "white")};
  p {
    font-weight: ${({ infobox }) => (infobox ? "300" : "normal")};
    margin: 0 0 5px 0;
  }
  h2 {
    margin: 0;
  }
`;
export const LabelValuePair = ({ label, value, infobox, width }) => {
  return (
    <LabelValue infobox={infobox} width={width}>
      <p>{label}&nbsp;</p>
      <h2>{value}</h2>
    </LabelValue>
  );
};
