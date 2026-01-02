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
<<<<<<< HEAD
          name={name}
          id={name}
          value={value || ""}
=======
>>>>>>> a97d937 (frontend changes in seperate login register component, seperator operator in common component, navbar object added, options mapped, fetapi url made common)
          placeholder=" "
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
