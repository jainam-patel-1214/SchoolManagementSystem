export const GradeValidation = (a)=>{
    if ((a < 1 || a > 12) && a !== null && a !== undefined) return false
    else return true
}

export const GrNoOrSubIdValidation = (b)=>{
    if ((b <= 0 || b > 99999999) && b !== undefined && b !== null) return false
    else return true
}

export const PasswordValidation = (c)=>{
    if (c !== undefined && c !== null && (c.toString().length !== 8)) return false
    else return true
}

export const StringValidator = (d)=>{
    const regex = /^[A-Za-z ]*$/;
    if (!(regex.test(d)) && d !== undefined && d !== null) return false
    else return true
}

export const MarkValidation = (e)=>{
    if (e != null && (e > 100 || e < 0)) return false
    else return true
}

export const TheoryMarksValidation = (f)=>{
    if ((f < 0 || f > 80) && f !== undefined && f !== null) return false
    else return true
}
export const PracticalMarksValidation = (g)=>{
    if ((g < 0 || g > 20) && g !== undefined && g !== null) return false
    else return true
}

export const TeacherAdminIdValid = (b)=>{
    if ((b <= 0 || b > 99999999) && b !== undefined && b !== null) return false
    else return true
}
export const isNotEmptyPair = (value)=>{
    if(value !== null && value !== undefined && value!==0 && value!=="")return true
    else return false
}