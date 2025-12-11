import styled from "styled-components"
import { TeacherInputTabContainer } from "./TeachersTab"
import { ErrorSpan, SearchForm } from "../studentComponents/SchoolRes"
import { InputContainer } from "../teacherComponents/StudentsTab"
import { RiBookShelfLine } from "react-icons/ri"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { TiSortAlphabetically } from "react-icons/ti"
import { Fragment } from "react/jsx-runtime"
import { PendingBtnComp } from "./Home"
import { InputContainerComponent } from "../helperComponents/InputContainer"


const DetailsForm = styled.div`
    display: none;
    position: fixed;
    top: 50%;
    left: 50%;
    width: 65%;
    transform: translate(-50%, -50%);
    padding: 1rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.3);
    z-index: 10;
`
const CloseBtn = styled.button`
    position: absolute;
    background-color: red;
    top: 8px;
    right: 8px;
    padding: 5px 10px;
    &:hover{
        background-color: ${(props) => { return props.variant === 'accept' ? "#15d200ff" : "#ff4f4fff" }};
        cursor: pointer;
    }
`
export const PopoupComponent = ({
    componentStyle,
    close,
    isTeacher,
    isStudent,
    submitHandler,
    data,
    newHandler
}) => {
    return (
        <DetailsForm style={componentStyle}>
            <SearchForm onSubmit={(e) => { submitHandler(e) }} style={{ width: "100%" }}>
                <InputContainerComponent width={"100%"} icon={RiBookShelfLine} type={"text"} name={"uid"} value={data.id} placeholder={" "} handler={newHandler} objKey={"id"} labelText={`Provide unique ${isStudent ? "student" : isTeacher ? "teacher" : "admin"} id:`}/>
                {isTeacher ?
                <InputContainerComponent width={"100%"} icon={TiSortAlphabetically} type={"number"} name={"sub"} value={data.subjectId} placeholder={" "} handler={newHandler} objKey={"subjectId"} labelText={`Provide sub id if teacher is assigned one:`}/>
                : <></>}
                {isStudent || isTeacher ? <Fragment>
                    <InputContainerComponent width={"100%"} icon={TiSortAlphabetically} type={"number"} name={"std"} value={data.std} placeholder={" "} handler={newHandler} objKey={"std"} labelText={`Provide standard:`}/>
                    <InputContainerComponent width={"100%"} icon={TiSortAlphabetically} type={"text"} name={"section"} value={data.section} placeholder={" "} handler={newHandler} objKey={"section"} labelText={`Provide section:`}/>
                </Fragment> : <></>}
                <PendingBtnComp type="submit" variant={"accept"}>Submit</PendingBtnComp>
                <CloseBtn id="closeBtn" type="reset" onClick={(e) => { close(e) }}>X</CloseBtn>
            </SearchForm>
        </DetailsForm>
    )
}