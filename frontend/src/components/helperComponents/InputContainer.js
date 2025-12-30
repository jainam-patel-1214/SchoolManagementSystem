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
  onInput,
  onFocus,
  onBlur,
  searchKeyHandler,
  errorColor,
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
          onChange={(e) => {
            const val = e.target.value;
            handler(objKey, val);
            searchKeyHandler?.(val);
          }}
          required={isRequired}
          onInput={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
          errorColor={errorColor}
        />
        <FloatingLabel>{labelText}</FloatingLabel>
      </InputWrapper>
    </InputContainer>
  );
};
