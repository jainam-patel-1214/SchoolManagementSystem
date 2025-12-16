import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../styled-components/InputComp";
import { InputContainer } from "../teacherComponents/StudentsTab";

export const InputContainerComponent = ({
  width,
  icon: Icon,
  name,
  value,
  handler,
  objKey,
  labelText,
  isRequired = false,
}) => {
  return (
    <InputContainer style={{ width: width }}>
      {Icon && <Icon style={{ fontSize: "xx-large" }} />}
      <InputWrapper>
        <FloatingInput
          type="text"
          name={name}
          value={value || ""}
          placeholder=" "
          onChange={(e) => handler(objKey, e.target.value)}
          required={isRequired}
        />
        <FloatingLabel>{labelText}</FloatingLabel>
      </InputWrapper>
    </InputContainer>
  );
};
