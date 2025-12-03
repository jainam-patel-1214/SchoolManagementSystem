import { ToastContainer, toast } from "react-toastify"
import styled from "styled-components"
import { useState, useRef } from "react"
import { StyledButton } from "../../styled-components/styledButton"
import { SubInfo, TableEntry } from "./Home"
import { ButtonContainer, InputContainer, TeacherInputTabContainer } from "../teacherComponents/StudentsTab"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { TiSortAlphabetically } from "react-icons/ti"
import { RiBookShelfLine } from "react-icons/ri"
import { PiLineSegmentsBold } from "react-icons/pi"
import { TableHeader } from "../../styled-components/TableComponents"
import { FetchApi } from "../../utils/FetchApi"
import { ErrorToast, Toaster } from "../../utils/Toaster"

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


export const SchoolResult = (props) => {
    const errorComp = useRef(null)
    
    const [section, setSection] = useState(null)
    const [grade, setGrade] = useState(null)
    const [minMark, setMinMark] = useState(null)
    const [maxMark, setMaxMark] = useState(null)
    const [displayData, setDisplayData] = useState()

    const changeHandler = (e, type) => {
        switch (type) {
            case "section":
                setSection(e.target.value)
                break;
            case "grade":
                setGrade(Number(e.target.value))
                break;
            case "min":
                setMinMark(Number(e.target.value))
                break;
            case "max":
                setMaxMark(Number(e.target.value))
                break;
            default:
                break;
        }
    }

    const fetchData = async (e) => {
        e.preventDefault()
        const regex = /^[A-Za-z ]*$/;
        const err = ['Max mark not allowed more than 100 or less than 0\n', 'Min mark not allowed less than 0 or greater than 100 \n', 'Grade/Std not allowed shall be between 1 and 12 inclusive \n', 'Min mark shall be less than max mark \n', 'Invalid section']
        let arr = [false, false, false, false, false]

        if (maxMark != null && (maxMark > 100 || maxMark < 0)) arr[0] = true
        if (minMark != null && (minMark < 0 || minMark > 100)) arr[1] = true
        if (grade != null && (grade < 1 || grade > 12)) arr[2] = true
        if (minMark != null && maxMark != null && maxMark <= minMark) arr[3] = true
        if (!(regex.test(section)) && section !== undefined && section !== null && section != '') arr[4] = true

        let ErrStr = ""
        let errExist = false
        arr.forEach((val, index) => {
            if (val === true) {
                errExist = true
                ErrStr += err[index]
            }
        })
        if (errExist) {
            errorComp.current.style.display = 'block'
            errorComp.current.innerText = ErrStr
            return
        }
        else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = 'none'
        }
        try {
            const apiUrl = `http://localhost:8090/${props.roleOfPerson}/display`;
            const params = { "viewByStd": grade, "viewBySection": section, "minPercent": minMark, "maxPercent": maxMark }
            const queryParams = {}
            let elem;
            for (elem of Object.keys(params)) {
                if (params[elem]!==null) {
                    queryParams[elem] = params[elem]
                }
            }
            
            const res = await FetchApi(apiUrl+"?"+new URLSearchParams(queryParams),"GET",{})
            Toaster(res,toast)
            if (res.output) {
                setDisplayData(res.output);
            } else{
                setDisplayData(res.error);
            }
        } catch (err) {
            console.log(err);
            ErrorToast(err.error,toast)
        } finally {
            cleanup()
            console.log(e);
            
            e.target.reset();
        }
    };

    const cleanup = () => {
        setSection(null)
        setGrade(null)
        setMinMark(null)
        setMaxMark(null)
    }

    return (
        <div>
        <SearchBoxSection>
            < ToastContainer />
            <SearchParamSection>
                <div>
                    <SearchForm action="" onSubmit={(e) => { fetchData(e) }}>
                        <TeacherInputTabContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <RiBookShelfLine style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="std" value={grade || ''} placeholder=" " onChange={(e) => { changeHandler(e, "grade") }} required />
                                    <FloatingLabel>Provide grade of class you wish to see result:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <TiSortAlphabetically style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="text" value={section || ''} name="section" placeholder=" " maxLength={2} onChange={(e) => { changeHandler(e, "section") }} />
                                    <FloatingLabel>Provide Class Section you wish to see result:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <TeacherInputTabContainer>
                            <label>Enter a range of marks you wish to filter : </label>
                            <InputContainer style={{ width: "50%" }}>
                                <PiLineSegmentsBold style={{ fontSize: "xx-large" }} />
                                <InputWrapper>
                                    <FloatingInput type="number" name="minpercent" value={minMark || ''} placeholder=" " onChange={(e) => { changeHandler(e, "min") }} />
                                    <FloatingLabel>Min marks:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                            <InputContainer style={{ width: "50%" }}>
                                <InputWrapper>
                                    <FloatingInput type="number" name="maxpercent" value={maxMark || ''} placeholder=" " onChange={(e) => { changeHandler(e, "max") }} />
                                    <FloatingLabel>Max marks:</FloatingLabel>
                                </InputWrapper>
                            </InputContainer>
                        </TeacherInputTabContainer>
                        <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                        <ButtonContainer>
                            <StyledButton  type="submit">Submit</StyledButton>
                        </ButtonContainer>
                    </SearchForm>
                </div>
            </SearchParamSection>
            </SearchBoxSection>
            {typeof(displayData)!=='string' && displayData!==null && displayData!==undefined ?
                <SearchOutputSection style={{paddingBottom:"1.5rem"}}>
                <h3 style={{ textAlign: "center" }}>List of students for requested filter</h3>
                <SubInfo style={{ width: "100%" }}>
                    <thead>
                        <tr>
                            <TableHeader>Student Name</TableHeader>
                            <TableHeader>Standard</TableHeader>
                            <TableHeader>Section</TableHeader>
                            <TableHeader>Subject Name</TableHeader>
                            <TableHeader>Practical Marks</TableHeader>
                            <TableHeader>Theory Marks</TableHeader>
                            <TableHeader>Grade</TableHeader>
                        </tr>
                    </thead>
                    <tbody>
                        {displayData?.map((element, index) => {
                            return (
                                <tr key={index}>
                                    <TableEntry>{element.studentName}</TableEntry>
                                    <TableEntry>{element.standard}</TableEntry>
                                    <TableEntry>{element.section}</TableEntry>
                                    <TableEntry>{element.subject}</TableEntry>
                                    <TableEntry>{element.practicalMarks}</TableEntry>
                                    <TableEntry>{element.theoryMarks}</TableEntry>
                                    <TableEntry>{element.grade}</TableEntry>
                                </tr>
                            )
                        })}
                    </tbody>
                </SubInfo>
                </SearchOutputSection>:<>{typeof(displayData)==='string'?<SearchOutputSection style={{ background: "#fa6c61", padding: "5px" }}>{displayData}</SearchOutputSection>:<></>} </>}
        </div>
    )
}