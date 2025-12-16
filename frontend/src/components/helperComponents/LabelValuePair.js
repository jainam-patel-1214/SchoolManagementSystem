import styled from "styled-components";

export const LabelValue = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;
export const LabelValuePair = ({ label, value }) => {
  return (
    <LabelValue>
      <p style={{ marginBottom: "5px" }}>
        <strong>{label}&nbsp;</strong>
      </p>
      <h2 style={{ margin: 0 }}>{value}</h2>
    </LabelValue>
  );
};
