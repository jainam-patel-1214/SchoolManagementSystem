import { ErrorToast } from "./Toaster"
import { GradeValidation, GrNoOrSubIdValidation, StringValidator } from "./validations";

export const adminRequestFieldValidator = (data, toast) => {
    switch (data?.role) {
        case "student":
            if (!GrNoOrSubIdValidation(Number(data?.id))||Number(data?.id)===0) {
                ErrorToast("invalid gr no/user id provided for student",toast)
                return
            }
            if (!GradeValidation(Number(data?.std))) {
                ErrorToast("invalid grade/std provided for student",toast)
                return
            }
            if (!StringValidator(data?.section)) {
                ErrorToast("invalid section provided for student",toast)
                return
            }
            break;
        case "teacher":
            if (!GrNoOrSubIdValidation(Number(data?.id))||Number(data?.id)===0) {
                ErrorToast("invalid gr teacher id assigned",toast)
                return
            }
            if (!GrNoOrSubIdValidation(Number(data?.subjectId))||Number(data?.subjectId)===0) {
                ErrorToast("invalid subject id assigned for teacher",toast)
                return
            }
            if (!GradeValidation(Number(data?.std))) {
                ErrorToast("invalid grade/std assigned for teacher",toast)
                return
            }
            if (!StringValidator(data?.section)) {
                ErrorToast("invalid section assigned for teacher",toast)
                return
            }
            break;
        case "admin":
            if (!GrNoOrSubIdValidation(Number(data?.id))||Number(data?.id)===0) {
                ErrorToast("invalid admin id provided",toast)
                return
            }
            break;
        default:
            ErrorToast("some error occured. please try again")
            break;
    }
}