/* eslint-disable no-undef */
import "cypress-real-events/support";

describe("teacher components testing", () => {
  before(() => {
    cy.registerWithApiCredentials("teacher");
  });

  beforeEach(() => {
    const user = Cypress.env("user");
    console.log("user of cypress eehre", user);

    cy.session(String(user.id), () => {
      cy.loginViaUI(user);
    });
    cy.getCookies().then((cookies) => {
      const cookieHeader = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      cy.request({
        method: "GET",
        url: "http://localhost:8090/teacher/removeUnwantedData",
        headers: {
          Cookie: cookieHeader,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
      });
    });
    cy.intercept("GET", "**/teacher/displayPerformance").as(
      "displayPerformance"
    );
    cy.visit("http://localhost:3000/app/teacher");
    cy.wait("@displayPerformance").its("response.statusCode").should("eq", 404);
  });

  it("navigation of teacher's components", () => {
    cy.get("#studentsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

    cy.get("#subjectsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/enterMarks");

    cy.get("#profileTab").realHover();
    cy.get("#navigateToAccountBtn").click();
    cy.location("pathname").should("eq", "/app/teacher");

    cy.get("#profileTab").realHover();
    cy.get("#reviewTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/reviews");
  });

  it("student create, edit, delete - success", () => {
    cy.intercept("PUT", "**/teacher/updateStud*").as("updateStudentRequest");
    cy.intercept("DELETE", "**/teacher/delStudent*").as("deleteStudentRequest");

    cy.createDemoStudentUser("teacher");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

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

    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

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
    cy.intercept("POST", "**/teacher/createSub*").as("createSubjectRequest");
    cy.intercept("PUT", "**/teacher/updateSub*").as("updateSubjectRequest");
    cy.intercept("DELETE", "**/teacher/delSubject*").as("deleteSubjectRequest");

    cy.createDemoSubject("teacher");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Go back to veiw subject list").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

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
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Go back to veiw subject list").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

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
    cy.intercept("DELETE", "**/teacher/delStudent*").as("deleteStudentRequest");

    cy.createDemoStudentUser("teacher");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

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

    cy.deleteDemoStudentUser("teacher");
  });

  it("subject edit - failure - invalid fields", () => {
    cy.intercept("DELETE", "**/teacher/delSubject*").as("deleteSubjectRequest");

    cy.createDemoSubject("teacher");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Go back to veiw subject list").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

    cy.contains("h4", "Drawing")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .first()
      .click();

    cy.get("#subLevel").clear().type("90");
    cy.contains("button", "Update Subject").click();
    cy.expectAndCloseToast("invalid grade. Allowed range is 1 - 12");

    cy.deleteDemoSubject("teacher");
  });

  it("student  create - failure - wrong field - already present - field empty", () => {
    cy.intercept("POST", "**/teacher/createStud*").as("createStudentRequest");
    cy.intercept("DELETE", "**/teacher/delStudent*").as("deleteStudentRequest");

    cy.get("#studentsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Create a new student here").click();
    cy.location("pathname").should("eq", "/app/teacher/addStudent");

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
    cy.deleteDemoStudentUser("teacher");
  });

  it("subject create - failure - invalid fields  - already present - limit unset", () => {
    cy.intercept("POST", "**/teacher/createSub*").as("createSubjectRequest");
    cy.intercept("DELETE", "**/teacher/delSubject*").as("deleteSubjectRequest");

    cy.get("#subjectsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Create a new subject here").click();
    cy.location("pathname").should("eq", "/app/teacher/addSubject");

    cy.get("#subId").type("99");
    cy.get("#subName").type("Drawing");

    cy.contains("button", "Create Subject").click();
    cy.expectAndCloseToast("Please fill all the fields");

    cy.get("#grade").type("14");
    cy.get("#credits").type("10");

    cy.contains("button", "Create Subject").click();
    cy.expectAndCloseToast("invalid grade. Allowed range is 1 - 12");

    cy.get("#grade").clear().type("10");

    cy.contains("button", "Create Subject").click();
    cy.wait("@createSubjectRequest")
      .its("response.statusCode")
      .should("eq", 400);
    cy.expectAndCloseToast(
      "first set limit of subjects allocated in 10 standard"
    );

    cy.get("#subId").clear().type("99");
    cy.get("#subName").clear().type("Drawing");
    cy.get("#grade").clear().type("1");
    cy.get("#credits").clear().type("10");

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

    cy.deleteDemoSubject("teacher");
  });

  it("enter marks record for student - success", () => {
    cy.intercept("POST", "**/teacher/enterMarks*").as(
      "createMarkRecordRequest"
    );

    cy.createDemoStudentUser("teacher");
    cy.createDemoSubject("teacher");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/enterMarks");

    cy.get("#subId").type("99");
    cy.get("#grNo").type("999");
    cy.get("#theory").type("70");
    cy.get("#practical").type("10");

    cy.contains("button", "Submit Marks").click();
    cy.wait("@createMarkRecordRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("inserted successfully");

    cy.deleteDemoStudentUser("teacher");
    cy.deleteDemoSubject("teacher");
  });

  it("edit marks record for student - success", () => {
    cy.intercept("POST", "**/teacher/enterMarks*").as(
      "createMarkRecordRequest"
    );
    cy.intercept("PUT", "**/teacher/updateMarks*").as(
      "updateMarkRecordRequest"
    );

    cy.createDemoStudentUser("teacher");
    cy.createDemoSubject("teacher");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/enterMarks");

    cy.insertMarks("999", "99", "50", "10", "teacher");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Update student marks record here").click();
    cy.location("pathname").should("eq", "/app/teacher/editMarks");

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

    cy.deleteDemoStudentUser("teacher");
    cy.deleteDemoSubject("teacher");
  });

  it("enter marks record for student - failure - invalid fields", () => {
    cy.intercept("POST", "**/teacher/enterMarks*").as(
      "createMarkRecordRequest"
    );

    cy.createDemoStudentUser("teacher");
    cy.createDemoSubject("teacher");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/enterMarks");

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

    cy.deleteDemoStudentUser("teacher");
    cy.deleteDemoSubject("teacher");
  });

  it("edit marks record for student - failure - invalid fields", () => {
    cy.intercept("POST", "**/teacher/enterMarks*").as(
      "createMarkRecordRequest"
    );
    cy.intercept("PUT", "**/teacher/updateMarks*").as(
      "updateMarkRecordRequest"
    );

    cy.createDemoStudentUser("teacher");
    cy.createDemoSubject("teacher");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/enterMarks");

    cy.insertMarks("999", "99", "50", "10", "teacher");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Update student marks record here").click();
    cy.location("pathname").should("eq", "/app/teacher/editMarks");

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
    cy.location("pathname").should("eq", "/app/teacher/enterMarks");
    cy.get(".parent-container").scrollTo("top");

    cy.contains("a", "Update student marks record here").click();
    cy.location("pathname").should("eq", "/app/teacher/editMarks");

    cy.get("#subId").type("1");
    cy.get("#grNo").type("999");

    cy.contains(
      "button",
      "Click here first to verify if student and subject record exists"
    ).click();
    cy.expectAndCloseToast(
      "Record doensot exist, please try creating one by clicking second link below"
    );

    cy.deleteDemoStudentUser("teacher");
    cy.deleteDemoSubject("teacher");
  });

  it("enter review - success", () => {
    cy.createDemoReview("teacher");
  });

  it("enter review - failure", () => {
    cy.intercept("POST", "**/teacher/addReview*").as("createReviewRequest");
    cy.createDemoStudentUser("teacher");

    cy.get("#profileTab").realHover();
    cy.get("#reviewTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/reviews");

    cy.get("#grNo").type("999");
    cy.contains("button", "Search").click();
    cy.expectAndCloseToast("Student Exists you wish to give review, go on!!");

    cy.get("#comment").type("good boy che aa manas");

    cy.contains("button", "Add Review").click();
    cy.wait("@createReviewRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.expectAndCloseToast("added successfully");

    cy.get("#profileTab").realHover();
    cy.get("#reviewTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/reviews");

    cy.get("#grNo").type("999887555467");
    cy.contains("button", "Search").click();
    cy.expectAndCloseToast("invalid gr no");

    cy.get("#grNo").clear().type("283923");
    cy.contains("button", "Search").click();
    cy.expectAndCloseToast(
      "Student doesnot exists you wish to edit, try again!!"
    );

    cy.get("#grNo").clear().type("999");
    cy.contains("button", "Search").click();
    cy.expectAndCloseToast("Student Exists you wish to give review, go on!!");

    cy.get("#comment").type("good");

    cy.contains("button", "Add Review").click();
    cy.expectAndCloseToast(
      "Please provide a comment within minimum 8 to maximum 250 characters"
    );

    cy.get("#comment").clear().type("most outstandign student of the class");
    cy.contains("button", "Add Review").click();
    cy.wait("@createReviewRequest")
      .its("response.statusCode")
      .should("eq", 400);
    cy.expectAndCloseToast("you can only enter comment once");

    cy.deleteDemoStudentUser("teacher");
  });
  it("cleanup", () => {
    cy.getCookies().then((cookies) => {
      const cookieHeader = cookies
        .map((c) => `${c.name}=${c.value}`)
        .join("; ");

      cy.request({
        method: "GET",
        url: "http://localhost:8090/teacher/removeUnwantedData",
        headers: {
          Cookie: cookieHeader,
        },
      }).then((res) => {
        expect(res.status).to.eq(200);
      });
    });
    cy.initialDataForStudentAndTeacher("teacher");
  });
});
