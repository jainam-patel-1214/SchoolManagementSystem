import styled from "styled-components";
export const SelectContainer = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
`;

export const FloatingSelectWrapper = styled.div`
  position: relative;
  width: 100%;
`;

export const FloatingSelect = styled.select`
  width: 100%;
  padding: 12px 10px;
  font-size: 16px;
  border: 1px solid gray;
  border-radius: 10px;
  outline: none;
  background: transparent;

  cursor: pointer;

  &:focus {
    border-color: #007bff;
  }
  &:not([value=""]) + label,
  &:focus + label {
    top: -15px;
    font-size: 12px;
    color: #007bff;
  }
`;
export const FloatingSelectLabel = styled.label`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: gray;
  pointer-events: none;
  background: white;
  padding: 0 5px;
  transition: all 0.2s ease;
`;

export const SelectComponent = ({
  icon: Icon,
  label,
  value,
  onChange,
  name,
  children,
}) => {
  return (
    <SelectContainer>
      {Icon && <Icon style={{ fontSize: "xx-large", margin: "10px" }} />}
      <FloatingSelectWrapper>
        <FloatingSelect value={value} onChange={onChange} name={name}>
          {children}
        </FloatingSelect>
        <FloatingSelectLabel>{label}</FloatingSelectLabel>
      </FloatingSelectWrapper>
    </SelectContainer>
  );
};
