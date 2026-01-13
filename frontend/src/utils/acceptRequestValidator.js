import { ErrorToast } from "./toasterCode";
import {
  GradeValidation,
  GrNoSubIdTeacherIdAdminIdValidation,
  StringValidator,
} from "./validations";

export const adminRequestFieldValidator = (data) => {
  switch (data.uRole) {
    case "student":
      if (!GrNoSubIdTeacherIdAdminIdValidation(data.id) || data.id === 0) {
        ErrorToast("invalid gr no/user id provided for student");
        return false;
      }
      if (!GradeValidation(data.std)) {
        ErrorToast("invalid grade/std provided for student");
        return false;
      }
      if (!StringValidator(data.section)) {
        ErrorToast("invalid section provided for student");
        return false;
      }
      return true;
    case "teacher":
      if (!GrNoSubIdTeacherIdAdminIdValidation(data.id) || data.id === 0) {
        ErrorToast("invalid gr teacher id assigned");
        return false;
      }
      if (
        !GrNoSubIdTeacherIdAdminIdValidation(data.subjectId) ||
        data.subjectId === 0
      ) {
        ErrorToast("invalid subject id assigned for teacher");
        return false;
      }
      if (data.std !== 0 && !GradeValidation(data.std)) {
        ErrorToast("invalid grade/std assigned for teacher");
        return false;
      }
      if (data.section !== "" && !StringValidator(data.section)) {
        ErrorToast("invalid section assigned for teacher");
        return false;
      }
      return true;
    case "admin":
      if (!GrNoSubIdTeacherIdAdminIdValidation(data.id) || data.id === 0) {
        ErrorToast("invalid admin id provided");
        return false;
      }
      return true;
    default:
      return false;
  }
};
