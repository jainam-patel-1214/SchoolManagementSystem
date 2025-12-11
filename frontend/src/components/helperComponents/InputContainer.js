import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { InputContainer, TeacherInputTabContainer } from "../teacherComponents/StudentsTab"

export const InputContainerComponent = ({width,icon:Icon,type,name,value,placeholder,handler,objKey,labelText}) => {
    return (
        <TeacherInputTabContainer>
            <InputContainer style={{ width: width }}>
                <Icon style={{ fontSize: "xx-large" }} />
                <InputWrapper>
                    {type==="number"?<FloatingInput type={type} name={name} value={value || ''} placeholder={placeholder} onChange={(e) => { handler(objKey,Number(e.target.value)) }} required />:<FloatingInput type={type} name={name} value={value || ''} placeholder={placeholder} onChange={(e) => handler(objKey,e.target.value) } required />}
                    <FloatingLabel>{labelText}</FloatingLabel>
                </InputWrapper>
            </InputContainer>
        </TeacherInputTabContainer>
    )
}