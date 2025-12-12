import { ToastContainer, toast } from "react-toastify"
import styled from "styled-components"
import { useState, useRef } from "react"
import { StyledButton } from "../../styled-components/StyledButton"
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../teacherComponents/StudentsTab"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { TiSortAlphabetically } from "react-icons/ti"
import { RiBookShelfLine } from "react-icons/ri"
import { PiLineSegmentsBold } from "react-icons/pi"
import { fetchApi } from "../../utils/fetchApi"
import { ErrorToast, Toaster } from "../../utils/toaster"
import { GradeValidation, MarkValidation, StringValidator } from "../../utils/validations"
import { ReactTableComponent } from "../helperComponents/ResultTable"
import { roleExtractor } from "../../utils/roleExtractor"

export const SearchBoxSection = styled.div`
    display: flex;
    flex-direction: column;
    width: 90%;
    margin: auto;
    margin-top: 2rem;
    padding: 5px 20px;
    background-color: #e9f8ffff;
    border-radius: 50px;
    border: 1px dotted blue;
`
export const SearchParamSection = styled.div`
    width: 100%;
    display: flex;
    flex-direction: column;
`
export const SearchOutputSection = styled.div`
    margin: 1rem auto;
    display: flex;
    flex-direction: column;
    width: 90%;
    padding: 5px 20px;
    background-color: #c8ffde95;
    border-radius: 50px;
    border: 2px solid #8fb352;
`
export const SearchForm = styled.form`
  display: flex;
  flex-direction: column;
  padding: 1rem;

  span input {
    margin: 15px;
    border: 1px solid grey;
    padding: 10px;
    border-radius: 5px;
  }

  span input::placeholder {
    color: #b5b5b5;
    /* padding: 5px; */
  }
`;
export const ErrorSpan = styled.div`
    color: red;
    background-color: #ffbbbb;
    width: fit-content;
    padding: 10px;
    margin-left: 1rem;
    display: none;
`


export const SchoolResult = () => {
    const userrole = roleExtractor(window.location.pathname)
    const errorComp = useRef(null)
    const columnDef = [
        {
            header: 'Student Name',
            accessorKey: 'studentName',
        },
        {
            header: 'Standard',
            accessorKey: 'standard',
        },
        {
            header: 'Section',
            accessorKey: 'section',
        },
        {
            header: 'Subject Name',
            accessorKey: 'subject',
        },
        {
            header: 'Practical Marks',
            accessorKey: 'practicalMarks',
        },
        {
            header: 'Theory Marks',
            accessorKey: 'theoryMarks',
        },
        {
            header: 'Grade',
            accessorKey: 'grade',
        },
    ]
    const initState = {
        section: "",
        grade: 0,
        minMark: null,
        maxMark: null
    }
    const [data, setData] = useState(initState)
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const [displayData, setDisplayData] = useState()
    const submitHandler = async (e) => {
        e.preventDefault()
        const errobj = {
            "max": { "condition": false, "message": 'Max mark not allowed more than 100 or less than 0' },
            "min": { "condition": false, "message": 'Min mark not allowed less than 0 or greater than 100' },
            "section": { "condition": false, "message": "Invalid section" },
            "std": { "condition": false, "message": "Grade/Std not allowed shall be between 1 and 12 inclusive" },
            "minmaxcompare":{"condition":false, "message":"Min mark shall be less than max mark"}
        }

        if (!MarkValidation(data?.maxMark)) errobj.max.condition = true
        if (!MarkValidation(data?.minMark)) errobj.min.condition = true
        if (!GradeValidation(data?.grade)) errobj.std.condition = true
        if (data?.minMark != null && data?.maxMark != null && data?.maxMark <= data?.minMark) errobj.minmaxcompare.condition = true
        if (!StringValidator(data?.section)) errobj.section.condition = true

        let errstr = ""
        let anyErr = false
        for (const val of Object.values(errobj)) {
            if (val?.condition) {
                errstr += `\n${val?.message}`;
                anyErr = true
            }
        }
        if (anyErr) {
            errorComp.current.style.display = 'block'
            errorComp.current.innerText = errstr
            return
        }
        else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = 'none'
        }
        try {
            const apiUrl = `http://localhost:8090/${userrole}/display`;
            const params = { "viewByStd": data.grade, "viewBySection": data.section, "minPercent": data.minMark, "maxPercent": data.maxMark }
            const queryParams = {}
            let elem;
            for (elem of Object.keys(params)) {
                if (params[elem] !== null) {
                    queryParams[elem] = params[elem]
                }
            }
            const res = await fetchApi(apiUrl + "?" + new URLSearchParams(queryParams), "GET", {})
            Toaster(res, toast)
            if (res.output) {
                setDisplayData(res.output);
            } else {
                setDisplayData(res.error);
            }
        } catch (err) {
            ErrorToast(err, toast)
        } finally {
            setData(initState);
            e.target.reset();
        }
    };

    return (
        <div>
            <SearchBoxSection>
                < ToastContainer />
                <SearchParamSection>
                    <div>
                        <SearchForm action="" onSubmit={(e) => { submitHandler(e) }}>
                            <TeacherInputTabContainer>
                                <InputContainer style={{ width: "50%" }}>
                                    <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                    <InputWrapper>
                                        <FloatingInput type="number" name="std" value={data.grade || ''} placeholder=" " onChange={(e) => { dataChangeHandler("grade",Number(e.target.value)) }} required />
                                        <FloatingLabel>Provide grade of class you wish to see result:</FloatingLabel>
                                    </InputWrapper>
                                </InputContainer>
                                <InputContainer style={{ width: "50%" }}>
                                    <TiSortAlphabetically style={{ fontSize: "xx-large" }} />
                                    <InputWrapper>
                                        <FloatingInput type="text" value={data.section || ''} name="section" placeholder=" " maxLength={2} onChange={(e) => { dataChangeHandler("section",(e.target.value)) }} />
                                        <FloatingLabel>Provide Class Section you wish to see result:</FloatingLabel>
                                    </InputWrapper>
                                </InputContainer>
                            </TeacherInputTabContainer>
                            <TeacherInputTabContainer>
                                <label>Enter a range of marks you wish to filter : </label>
                                <InputContainer style={{ width: "50%" }}>
                                    <PiLineSegmentsBold style={{ fontSize: "xx-large" }} />
                                    <InputWrapper>
                                        <FloatingInput type="number" name="minpercent" value={data.minMark || ''} placeholder=" " onChange={(e) => { dataChangeHandler("minMark",Number(e.target.value)) }} />
                                        <FloatingLabel>Min marks:</FloatingLabel>
                                    </InputWrapper>
                                </InputContainer>
                                <InputContainer style={{ width: "50%" }}>
                                    <InputWrapper>
                                        <FloatingInput type="number" name="maxpercent" value={data.maxMark || ''} placeholder=" " onChange={(e) => { dataChangeHandler("maxMark",Number(e.target.value))}} />
                                        <FloatingLabel>Max marks:</FloatingLabel>
                                    </InputWrapper>
                                </InputContainer>
                            </TeacherInputTabContainer>
                            <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                            <ButtonContainer>
                                <StyledButton type="submit">Submit</StyledButton>
                            </ButtonContainer>
                        </SearchForm>
                    </div>
                </SearchParamSection>
            </SearchBoxSection>
            {typeof (displayData) !== 'string' && displayData !== null && displayData !== undefined ?
                <ReactTableComponent data={displayData} columnDefinition={columnDef} heading={"List of students for requested filter"}></ReactTableComponent> : <>{typeof (displayData) === 'string' ? <SearchOutputSection style={{ background: "#fa6c61", padding: "5px" }}>{displayData}</SearchOutputSection> : <></>} </>}
        </div>
    )
}