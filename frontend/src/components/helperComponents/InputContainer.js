import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../styled-components/InputComp";
import { InputContainer } from "../teacherComponents/StudentsTab";

export const InputContainerComponent = ({
  icon: Icon,
  handler,
  objKey,
  labelText,
  searchKeyHandler,
  width,
  ...rest
}) => {
  return (
    <InputContainer style={{ width }}>
      {Icon && <Icon style={{ fontSize: "xx-large" }} />}
      <InputWrapper>
        <FloatingInput
          type="text"
          value={rest.value || ""}
          placeholder=" "
          autoComplete="off"
          id={rest.name}
          onChange={(e) => {
            const val = e.target.value;
            handler(objKey, val);
            searchKeyHandler?.(val);
          }}
          {...rest}
        />
        <FloatingLabel>{labelText}</FloatingLabel>
      </InputWrapper>
    </InputContainer>
  );
};
