import { toast, ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/Toaster";
import { TeacherAdminIdValid } from "../../../utils/validations";
import { useRef, useState } from "react";
import { ErrorSpan, SearchBoxSection, SearchForm, SearchParamSection } from "../../studentComponents/SchoolRes";
import { TeacherInputTabContainer } from "../TeachersTab";
import { ButtonContainer, InputContainer } from "../../teacherComponents/StudentsTab";
import { GiTeacher } from "react-icons/gi";
import { FloatingInput, FloatingLabel, InputWrapper } from "../../../styled-components/InputComp";
import { StyledButton } from "../../../styled-components/styledButton";
import { ReactTableComponent } from "../../helperComponents/ResultTable";
import { fetchApi } from "../../../utils/fetchApi";
import { roleExtractor } from "../../../utils/roleExtractor";

export const DisplayTeacherPerformanceComponent = () => {
    const userrole = roleExtractor(window.location.pathname)
    const errorComp = useRef(null)
    const [tid, setTid] = useState(null)
    const [displayData, setDisplayData] = useState(null)

    const submitHandler = async (e, apiUrl) => {
        e.preventDefault()

        const errobj = { "tid": { "condition": false, "message": "invalid teacher id" } }
        if (!TeacherAdminIdValid(tid)) errobj.tid.condition = true
        if (errobj.tid.condition) {
            errorComp.current.innerText = errobj.tid.message
            errorComp.current.style.display = "block"
            return
        } else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = "none"
        }
        try {
            let res;
            res = await fetchApi(apiUrl, "GET", {})
            Toaster(res, toast)
            if (res.output) {
                setDisplayData(res.output)
                return
            }
        } catch (err) {
            ErrorToast(err, toast)
        } finally {
            setTid(null)
            e.target.reset();
        }
    };

    const columnDef = [
        {
            header: 'Teacher Id',
            accessorKey: 'Tid',
        },
        {
            header: 'Teacher Name',
            accessorKey: 'TName',
        },
        {
            header: 'Standard Allocated',
            accessorKey: 'StdAllocated',
        },
        {
            header: 'Subject Allocated',
            accessorKey: 'SubName',
        },
        {
            header: 'Total Practical Marks',
            accessorKey: 'TotalPracticalMarks',
        },
        {
            header: 'Total Theory Marks',
            accessorKey: 'TotalTheoryMarks',
        },
    ]
    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <SearchForm onSubmit={(e) => { submitHandler(e, `http://localhost:8090/${userrole}/displayTeacherPerformance/${tid}`) }}>
                        <TeacherInputTabContainer>
                            <InputContainer>
                                <GiTeacher style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" value={tid || ''} name="teacherid" placeholder=" " maxLength={8} onChange={(e) => { setTid(e.target.value) }} />
                                    <FloatingLabel>Provide id of teacher you wish to look performance:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton type="submit">Submit</StyledButton>
                        </ButtonContainer>
                    </SearchForm>
                </SearchParamSection>
            </SearchBoxSection>
            {typeof (displayData) !== 'string' && displayData?.length>0 && displayData !== undefined && displayData !== null ?
                <ReactTableComponent data={displayData} columnDefinition={columnDef} heading={"Performance among teacher's peers"}/>
                : <>{displayData}</>}
        </div>
    )
}