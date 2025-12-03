export const GradeCalculator = (marks)=>{
    if (marks>=90) {
        return "Passed with distinction"
    } else if (marks>=75&&marks<90) {
        return "Passed with merit"
    } else if (marks>=60&&marks<75) {
        return "Passed"
    } else if (marks>=40&&marks<60) {
        return "Passed but try to acieve more"
    } else if(marks<40){
        return "Failed"
    }
}