import { ErrorToast } from "./toasterCode";
import {
  GradeValidation,
  GrNoOrSubIdValidation,
  StringValidator,
} from "./validations";

export const adminRequestFieldValidator = (data) => {
  console.log("data here", data);

  switch (data.uRole) {
    case "student":
      if (!GrNoOrSubIdValidation(data.id) || data.id === 0) {
        ErrorToast("invalid gr no/user id provided for student");
        return false;
      }
      if (!GradeValidation(data.std)) {
        console.log("std validation");

        ErrorToast("invalid grade/std provided for student");
        return false;
      }
      if (!StringValidator(data.section)) {
        ErrorToast("invalid section provided for student");
        return false;
      }
      break;
    case "teacher":
      if (!GrNoOrSubIdValidation(data.id) || data.id === 0) {
        ErrorToast("invalid gr teacher id assigned");
        return false;
      }
      if (!GrNoOrSubIdValidation(data.subjectId) || data.subjectId === 0) {
        ErrorToast("invalid subject id assigned for teacher");
        return false;
      }
      if (!GradeValidation(data.std)) {
        ErrorToast("invalid grade/std assigned for teacher");
        return false;
      }
      if (!StringValidator(data.section)) {
        ErrorToast("invalid section assigned for teacher");
        return false;
      }
      break;
    case "admin":
      if (!GrNoOrSubIdValidation(data.id) || data.id === 0) {
        ErrorToast("invalid admin id provided");
        return false;
      }
      break;
    default:
      return true;
  }
};
