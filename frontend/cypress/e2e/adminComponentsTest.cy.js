/* eslint-disable no-undef */
import "cypress-real-events/support";

describe("admin components testing", () => {
  before(() => {
    cy.registerWithApiCredentials("admin");
  });

  beforeEach(() => {
    const user = Cypress.env("user");
    console.log("user of cypress eehre", user);

    cy.session(String(user.id), () => {
      cy.loginViaUI(user);
    });
    cy.visit("http://localhost:3000/app/admin");
  });

  it("navigation of admin's components", () => {
    cy.get("#teacherTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/displayTeacher");

    cy.get("#studentsTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/displayStudent");

    cy.get("#subjectsTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/displaySubject");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/enterMarks");

    cy.get("#profileTab").realHover();
    cy.get("#navigateToAccountBtn").click();
    cy.location("pathname").should("eq", "/app/admin");

    cy.get("#profileTab").realHover();
    cy.get("#pendingRequestTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/pendingApplications");
  });

  it("student create, edit, delete - success", () => {
    cy.intercept("POST", "**/admin/createStud*").as("createStudentRequest");
    cy.intercept("PUT", "**/admin/updateStud*").as("updateStudentRequest");
    cy.intercept("DELETE", "**/admin/delStudent*").as("deleteStudentRequest");

    cy.createDemoStudentUser("admin");

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/admin/displayStudent");

    cy.contains("h4", "gandhi")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .first()
      .click();

    cy.get("#password").clear().type("NEW12password");
    cy.get("#name").clear().type("mahatmagandhi");

    cy.contains("button", "Update Student").click();
    cy.wait("@updateStudentRequest")
      .its("response.statusCode")
      .should("eq", 200);

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/admin/displayStudent");

    cy.contains("h4", "mahatmagandhi")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .last()
      .click();

    cy.wait("@deleteStudentRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("DELETED SUCCESSFULLY");
  });

  it("subject create, edit, delete - success", () => {
    cy.intercept("PUT", "**/admin/updateSub*").as("updateSubjectRequest");
    cy.intercept("DELETE", "**/admin/delSubject*").as("deleteSubjectRequest");

    cy.createDemoSubject("admin");

    cy.contains("a", "Go back to veiw subject list").click();
    cy.location("pathname").should("eq", "/app/admin/displaySubject");

    cy.contains("h4", "Drawing")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .first()
      .click();

    cy.get("#subname").clear().type("drawingg");
    cy.get("#credits").clear().type("0");

    cy.contains("button", "Update Subject").click();
    cy.wait("@updateSubjectRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("subject updated successfully");

    cy.contains("a", "Go back to veiw subject list").click();
    cy.location("pathname").should("eq", "/app/admin/displaySubject");

    cy.contains("h4", "drawingg")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .last()
      .click();

    cy.wait("@deleteSubjectRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("DELETED SUCCESSFULLY");
  });

  it("student  edit - failure - wrong field", () => {
    cy.intercept("POST", "**/admin/createStud*").as("createStudentRequest");
    cy.intercept("DELETE", "**/admin/delStudent*").as("deleteStudentRequest");

    cy.createDemoStudentUser("admin");

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/admin/displayStudent");

    cy.contains("h4", "gandhi")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .first()
      .click();

    cy.get("#password").clear().type("passwor");
    cy.contains("button", "Update Student").click();
    cy.expectAndCloseToast("passwords are needed to be atleast 8 digits");

    cy.get("#password").clear().type("password");
    cy.get("#name").clear().type("gandhi 12");
    cy.contains("button", "Update Student").click();
    cy.expectAndCloseToast("invalid name");

    cy.get("#name").clear().type("gandhi");
    cy.get("#std").clear().type("13");
    cy.contains("button", "Update Student").click();
    cy.expectAndCloseToast("standard shall have range of 1 - 12");

    cy.get("#std").clear().type("12");
    cy.get("#section").clear().type("A3");
    cy.contains("button", "Update Student").click();
    cy.expectAndCloseToast("invalid section");

    cy.deleteDemoStudentUser("admin");
  });

  it("subject edit - failure - invalid fields", () => {
    cy.intercept("POST", "**/admin/createSub*").as("createSubjectRequest");
    cy.intercept("DELETE", "**/admin/delSubject*").as("deleteSubjectRequest");

    cy.createDemoSubject("admin");

    cy.contains("a", "Go back to veiw subject list").click();
    cy.location("pathname").should("eq", "/app/admin/displaySubject");

    cy.contains("h4", "Drawing")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .first()
      .click();

    cy.get("#subLevel").clear().type("90");
    cy.contains("button", "Update Subject").click();
    cy.expectAndCloseToast("invalid grade. Allowed range is 1 - 12");

    cy.deleteDemoSubject("admin");
  });

  it("student  create - failure - wrong field - already present - field empty", () => {
    cy.intercept("POST", "**/admin/createStud*").as("createStudentRequest");
    cy.intercept("DELETE", "**/admin/delStudent*").as("deleteStudentRequest");

    cy.get("#studentsTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/displayStudent");

    cy.contains("a", "Create a new student here").click();
    cy.location("pathname").should("eq", "/app/admin/addStudent");

    cy.get("#grNo").type("999");
    cy.get("#password").type("password");
    cy.get("#name").type("gandhi");

    cy.contains("button", "Create Student").click();
    cy.expectAndCloseToast("Fill all the values below");

    cy.get("#section").type("A");
    cy.get("#std").type("1");
    cy.get("#password").clear().type("passwor");

    cy.contains("button", "Create Student").click();
    cy.expectAndCloseToast("passwords are needed to be atleast 8 digits");

    cy.get("#password").type("d");
    cy.get("#grNo").type("9999999");
    cy.contains("button", "Create Student").click();
    cy.expectAndCloseToast("invalid gr no");

    cy.get("#grNo").clear().type("999");
    cy.get("#std").clear().type("15");
    cy.contains("button", "Create Student").click();
    cy.expectAndCloseToast("standard shall have range of 1 - 12");

    cy.get("#std").clear().type("5");
    cy.get("#name").type("12");
    cy.contains("button", "Create Student").click();
    cy.expectAndCloseToast("invalid name");

    cy.get("#name").clear().type("gandhi");
    cy.get("#section").type("1");
    cy.contains("button", "Create Student").click();
    cy.expectAndCloseToast("invalid section");
    cy.get("#section").clear().type("A");

    cy.contains("button", "Create Student").click();
    cy.wait("@createStudentRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("student created");

    cy.get("#grNo").type("999");
    cy.get("#password").type("password");
    cy.get("#name").type("secondgandhi");
    cy.get("#section").type("A");
    cy.get("#std").type("1");

    cy.contains("button", "Create Student").click();
    cy.wait("@createStudentRequest")
      .its("response.statusCode")
      .should("eq", 400);
    cy.expectAndCloseToast(
      "student already exist with gr number provided, try updating student details"
    );
    cy.deleteDemoStudentUser("admin");
  });

  it("subject create - failure - invalid fields  - already present - limit unset", () => {
    cy.intercept("POST", "**/admin/createSub*").as("createSubjectRequest");
    cy.intercept("DELETE", "**/admin/delSubject*").as("deleteSubjectRequest");

    cy.get("#subjectsTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/displaySubject");

    cy.contains("a", "Create a new subject here").click();
    cy.location("pathname").should("eq", "/app/admin/addSubject");

    cy.get("#subId").type("99");
    cy.get("#subName").type("Drawing");

    cy.contains("button", "Create Subject").click();
    cy.expectAndCloseToast("Please fill all the fields");

    cy.get("#grade").type("14");
    cy.get("#credits").type("10");

    cy.contains("button", "Create Subject").click();
    cy.expectAndCloseToast("invalid grade. Allowed range is 1 - 12");

    cy.get("#grade").clear().type("5");

    cy.contains("button", "Create Subject").click();
    cy.wait("@createSubjectRequest")
      .its("response.statusCode")
      .should("eq", 400);
    cy.expectAndCloseToast(
      "first set limit of subjects allocated in 5 standard"
    );

    cy.get("#subId").type("99");
    cy.get("#subName").type("Drawing");
    cy.get("#grade").type("1");
    cy.get("#credits").type("10");

    cy.contains("button", "Create Subject").click();
    cy.wait("@createSubjectRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("inserted successfully");

    cy.get("#subId").type("99");
    cy.get("#subName").type("DrawingSketch");
    cy.get("#grade").type("1");
    cy.get("#credits").type("10");

    cy.contains("button", "Create Subject").click();
    cy.wait("@createSubjectRequest")
      .its("response.statusCode")
      .should("eq", 400);
    cy.expectAndCloseToast(
      "subject already exist with id provided, try updating subject details"
    );

    cy.deleteDemoSubject("admin");
  });

  it("enter marks record for student - success", () => {
    cy.intercept("POST", "**/admin/enterMarks*").as("createMarkRecordRequest");

    cy.createDemoStudentUser("admin");
    cy.createDemoSubject("admin");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/enterMarks");

    cy.get("#subId").type("99");
    cy.get("#grNo").type("999");
    cy.get("#theory").type("70");
    cy.get("#practical").type("10");

    cy.contains("button", "Submit Marks").click();
    cy.wait("@createMarkRecordRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("inserted successfully");

    cy.deleteDemoStudentUser("admin");
    cy.deleteDemoSubject("admin");
  });

  it("edit marks record for student - success", () => {
    cy.intercept("POST", "**/admin/enterMarks*").as("createMarkRecordRequest");
    cy.intercept("PUT", "**/admin/updateMarks*").as("updateMarkRecordRequest");

    cy.createDemoStudentUser("admin");
    cy.createDemoSubject("admin");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/enterMarks");

    cy.get("#subId").type("99");
    cy.get("#grNo").type("999");
    cy.get("#theory").type("50");
    cy.get("#practical").type("10");

    cy.contains("button", "Submit Marks").click();
    cy.wait("@createMarkRecordRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("inserted successfully");

    cy.contains("a", "Update student marks record here").click();
    cy.location("pathname").should("eq", "/app/admin/editMarks");

    cy.get("#subId").type("99");
    cy.get("#grNo").type("999");

    cy.contains(
      "button",
      "Click here first to verify if student and subject record exists"
    ).click();
    cy.expectAndCloseToast("Record exists, you can edit it successfully");

    cy.get("#theory").clear().type("70");
    cy.get("#practical").clear().type("20");

    cy.contains("button", "Update Marks").click();
    cy.wait("@updateMarkRecordRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("student updated successfully");

    cy.deleteDemoStudentUser("admin");
    cy.deleteDemoSubject("admin");
  });

  it("enter marks record for student - failure - invalid fields", () => {
    cy.intercept("POST", "**/admin/enterMarks*").as("createMarkRecordRequest");

    cy.createDemoStudentUser("admin");
    cy.createDemoSubject("admin");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/enterMarks");

    cy.get("#subId").type("99");
    cy.get("#grNo").type("999");
    cy.get("#theory").type("-70");
    cy.get("#practical").type("10");

    cy.contains("button", "Submit Marks").click();
    cy.expectAndCloseToast("theory marks range shall be from 0 to 80");

    cy.get("#theory").clear().type("70");
    cy.get("#practical").clear().type("-10");
    cy.contains("button", "Submit Marks").click();
    cy.expectAndCloseToast("practical marks range shall be from 0 to 20");

    cy.deleteDemoStudentUser("admin");
    cy.deleteDemoSubject("admin");
  });

  it("edit marks record for student - failure - invalid fields", () => {
    cy.intercept("POST", "**/admin/enterMarks*").as("createMarkRecordRequest");
    cy.intercept("PUT", "**/admin/updateMarks*").as("updateMarkRecordRequest");

    cy.createDemoStudentUser("admin");
    cy.createDemoSubject("admin");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/enterMarks");

    cy.get("#subId").type("99");
    cy.get("#grNo").type("999");
    cy.get("#theory").type("50");
    cy.get("#practical").type("10");

    cy.contains("button", "Submit Marks").click();
    cy.wait("@createMarkRecordRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("inserted successfully");

    cy.contains("a", "Update student marks record here").click();
    cy.location("pathname").should("eq", "/app/admin/editMarks");

    cy.get("#subId").type("99");
    cy.get("#grNo").type("999");

    cy.contains(
      "button",
      "Click here first to verify if student and subject record exists"
    ).click();
    cy.expectAndCloseToast("Record exists, you can edit it successfully");

    cy.get("#theory").clear().type("-70");

    cy.contains("button", "Update Marks").click();
    cy.expectAndCloseToast("theory marks range shall be from 0 to 80");

    cy.get("#theory").clear().type("70");
    cy.get("#practical").clear().type("-10");

    cy.contains("button", "Update Marks").click();
    cy.expectAndCloseToast("practical marks range shall be from 0 to 20");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/admin/enterMarks");
    cy.contains("a", "Update student marks record here").click();
    cy.location("pathname").should("eq", "/app/admin/editMarks");

    cy.get("#subId").type("1");
    cy.get("#grNo").type("999");

    cy.contains(
      "button",
      "Click here first to verify if student and subject record exists"
    ).click();
    cy.expectAndCloseToast(
      "Record doensot exist, please try creating one by clicking second link below"
    );

    cy.deleteDemoStudentUser("admin");
    cy.deleteDemoSubject("admin");
  });

  it("create teacher - success", () => {
    cy.createDemoTeacherUser("admin");
    cy.deleteDemoTeacherUser("admin");
  });

  it("edit teacher - success", () => {
    cy.intercept("PUT", `**/admin/editTeacher*`).as("editTeacherRequest");

    cy.createDemoTeacherUser("admin");
    cy.createDemoSubject("admin");

    cy.contains("a", "Go back to veiw teacher's list").click();
    cy.location("pathname").should("eq", "/app/admin/displayTeacher");

    cy.contains("h4", "TempTeacherUser")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .first()
      .click();
    cy.location("pathname").should("include", "/app/admin/editTeacher");

    cy.get("#subname").type("99");
    cy.get("#std").type("5");
    cy.get("#section").type("C");

    contains("button", "Update Teacher").click();
    cy.wait("@editTeacherRequest").its("response.statusCode").should("eq", 200);
    cy.expectAndCloseToast("UPDATED SUCCESSFULLY");

    cy.deleteDemoTeacherUser("admin");
    cy.deleteDemoSubject("admin");
  });
});
