import { ErrorSpan, SearchBoxSection, SearchForm, SearchParamSection } from "../studentComponents/SchoolRes"
import { toast, ToastContainer } from "react-toastify"
import { StyledButton } from "../../styled-components/styledButton"
import { useRef, useState } from "react"
import { InputContainer, TeacherInputTabContainer } from "./StudentsTab"
import { FloatingInput, FloatingLabel, InputWrapper } from "../../styled-components/InputComp"
import { MdRateReview } from "react-icons/md"
import { FaCircleUser } from "react-icons/fa6"
import { FetchApi } from "../../utils/FetchApi"
import { ErrorToast, Toaster } from "../../utils/Toaster"
import { GrNoOrSubIdValidation } from "../../utils/Validations"
import { roleExtractor } from "../../utils/RoleExtractor"

export const ReviewTab = () => {
    const errorComp = useRef(null)
    const userrole = roleExtractor(window.location.pathname)
    const initState = {
        grNo: 0,
        comment: "",
    }
    const [data, setData] = useState(initState)
    const dataChangeHandler = (key, value) => {
        setData(prevdata => ({
            ...prevdata,
            [key]: value
        }))
    }
    const sumbitHandler = async (e) => {
        e.preventDefault()
        const errobj = { "grno": { "condition": false, "message": "invalid gr no" }, "comment": { "condition": false, "message": "Please provide a comment to add" }}
        if (data?.comment?.length <= 0) errobj.comment.condition = true
        if (!GrNoOrSubIdValidation(data?.grNo)) errobj.grno.condition = true
        let errstr = ""
        let anyErr = false
        for (const val of Object.values(errobj)) {
            if (val?.condition) {
                errstr += `\n${val?.message}`;
                anyErr = true
            }
        }
        if (anyErr) {
            errorComp.current.innerText = errstr
            errorComp.current.style.display = "block"
            return
        } else {
            errorComp.current.innerText = ""
            errorComp.current.style.display = "none"
        }
        try {
            const apiUrl = `http://localhost:8090/${userrole}/addReview`;
            const res = await FetchApi(apiUrl,"POST",{ "grNo": data?.grNo, "comment": data?.comment })
            Toaster(res,toast)
        } catch (err) {
            ErrorToast(err,toast)
        } finally {
            setData(initState)
            e.target.reset();
        }
    }

    return (
        <SearchBoxSection>
            < ToastContainer />
            <SearchParamSection>
                <SearchForm onSubmit={(e) => { sumbitHandler(e) }}>
                    <TeacherInputTabContainer>
                        <InputContainer style={{ width: "50%" }}>
                            <FaCircleUser style={{ fontSize: "xx-large" }} />
                            <InputWrapper>
                                <FloatingInput type="number" value={data.grNo || ""} required name="grno" placeholder=" " onChange={(e) => { dataChangeHandler("grNo",Number(e.target.value)) }} />
                                <FloatingLabel>Provide Gr NO. of the student:</FloatingLabel>
                            </InputWrapper>
                        </InputContainer>
                        <InputContainer style={{ width: "50%" }}>
                            <MdRateReview style={{ fontSize: "xx-large" }} />
                            <InputWrapper>
                                <FloatingInput type="text" required name="review" value={data.comment || ""} placeholder=" " onChange={(e) => { dataChangeHandler("comment",e.target.value) }} maxLength={254} />
                                <FloatingLabel>Enter a review:</FloatingLabel>
                            </InputWrapper>
                        </InputContainer>
                    </TeacherInputTabContainer>
                    <ErrorSpan id="minmaxerror" ref={errorComp}></ErrorSpan>
                    <buttonComp>
                        <StyledButton>Submit</StyledButton>
                    </buttonComp>
                </SearchForm>
            </SearchParamSection>
        </SearchBoxSection>
    )
}
