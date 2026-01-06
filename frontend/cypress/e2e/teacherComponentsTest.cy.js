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
    cy.intercept("POST", "**/teacher/createStud*").as("createStudentRequest");
    cy.intercept("PUT", "**/teacher/updateStud*").as("updateStudentRequest");
    cy.intercept("DELETE", "**/teacher/delStudent*").as("deleteStudentRequest");

    cy.get("#studentsTabBtn").click();

    cy.contains("a", "Create a new student here").click();
    cy.location("pathname").should("eq", "/app/teacher/addStudent");

    cy.get("#grNo").type("999");
    cy.get("#password").type("password");
    cy.get("#name").type("gandhi");
    cy.get("#section").type("A");
    cy.get("#std").type("1");

    cy.contains("button", "Create Student").click();
    cy.wait("@createStudentRequest")
      .its("response.statusCode")
      .should("eq", 200);

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

    cy.get(".Toastify__toast").should("contain", "DELETED SUCCESSFULLY");
  });

  it("subject create, edit, delete - success", () => {
    cy.intercept("POST", "**/teacher/createSub*").as("createSubjectRequest");
    cy.intercept("PUT", "**/teacher/updateSub*").as("updateSubjectRequest");
    cy.intercept("DELETE", "**/teacher/delSubject*").as("deleteSubjectRequest");

    cy.get("#subjectsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

    cy.contains("a", "Create a new subject here").click();
    cy.location("pathname").should("eq", "/app/teacher/addSubject");

    cy.get("#subId").type("99");
    cy.get("#subName").type("Drawing");
    cy.get("#grade").type("1");
    cy.get("#credits").type("10");

    cy.contains("button", "Create Subject").click();
    cy.wait("@createSubjectRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.get(".Toastify__toast").should("contain", "inserted successfully");

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
    cy.get(".Toastify__toast").should(
      "contain",
      "subject updated successfully"
    );

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
    cy.get(".Toastify__toast").should("contain", "DELETED SUCCESSFULLY");
  });

  it("student  edit - failure - wrong field", () => {
    cy.intercept("POST", "**/teacher/createStud*").as("createStudentRequest");
    cy.intercept("DELETE", "**/teacher/delStudent*").as("deleteStudentRequest");

    cy.get("#studentsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

    cy.contains("a", "Create a new student here").click();
    cy.location("pathname").should("eq", "/app/teacher/addStudent");

    cy.get("#grNo").type("999");
    cy.get("#password").type("password");
    cy.get("#name").type("gandhi");
    cy.get("#section").type("A");
    cy.get("#std").type("1");

    cy.contains("button", "Create Student").click();
    cy.wait("@createStudentRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.get(".Toastify__toast").should("contain", "student created");

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
    cy.get(".Toastify__toast").should(
      "contain",
      "passwords are needed to be atleast 8 digits"
    );

    cy.get("#password").clear().type("password");
    cy.get("#name").clear().type("gandhi 12");
    cy.contains("button", "Update Student").click();
    cy.get(".Toastify__toast").should("contain", "invalid name");

    cy.get("#name").clear().type("gandhi");
    cy.get("#std").clear().type("13");
    cy.contains("button", "Update Student").click();
    cy.get(".Toastify__toast").should(
      "contain",
      "standard shall have range of 1 - 12"
    );

    cy.get("#std").clear().type("12");
    cy.get("#section").clear().type("A3");
    cy.contains("button", "Update Student").click();
    cy.get(".Toastify__toast").should("contain", "invalid section");

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

    cy.contains("h4", "gandhi")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .last()
      .click();

    cy.wait("@deleteStudentRequest")
      .its("response.statusCode")
      .should("eq", 200);

    cy.get(".Toastify__toast").should("contain", "DELETED SUCCESSFULLY");
  });

  it("subject edit - failure - invalid fields", () => {
    cy.intercept("POST", "**/teacher/createSub*").as("createSubjectRequest");
    cy.intercept("DELETE", "**/teacher/delSubject*").as("deleteSubjectRequest");

    cy.get("#subjectsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

    cy.contains("a", "Create a new subject here").click();
    cy.location("pathname").should("eq", "/app/teacher/addSubject");

    cy.get("#subId").type("99");
    cy.get("#subName").type("Drawing");
    cy.get("#grade").type("1");
    cy.get("#credits").type("10");

    cy.contains("button", "Create Subject").click();
    cy.wait("@createSubjectRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.get(".Toastify__toast").should("contain", "inserted successfully");

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
    cy.get(".Toastify__toast").should(
      "contain",
      "invalid grade. Allowed range is 1 - 12"
    );

    cy.contains("a", "Go back to veiw subject list").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

    cy.contains("h4", "Drawing")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .last()
      .click();

    cy.wait("@deleteSubjectRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.get(".Toastify__toast").should("contain", "DELETED SUCCESSFULLY");
  });

  it("student  create - failure - wrong field - already present - field empty", () => {
    cy.intercept("POST", "**/teacher/createStud*").as("createStudentRequest");
    cy.intercept("DELETE", "**/teacher/delStudent*").as("deleteStudentRequest");

    cy.get("#studentsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

    cy.contains("a", "Create a new student here").click();
    cy.location("pathname").should("eq", "/app/teacher/addStudent");

    cy.get("#grNo").type("999");
    cy.get("#password").type("password");
    cy.get("#name").type("gandhi");

    cy.contains("button", "Create Student").click();
    cy.get(".Toastify__toast").should("contain", "Fill all the values below");

    cy.get("#section").type("A");
    cy.get("#std").type("1");
    cy.get("#password").clear().type("passwor");

    cy.contains("button", "Create Student").click();
    cy.get(".Toastify__toast").should(
      "contain",
      "passwords are needed to be atleast 8 digits"
    );

    cy.get("#password").type("d");
    cy.get("#grNo").type("9999999");
    cy.contains("button", "Create Student").click();
    cy.get(".Toastify__toast").should("contain", "invalid gr no");

    cy.get("#grNo").clear().type("999");
    cy.get("#std").type("5");
    cy.contains("button", "Create Student").click();
    cy.get(".Toastify__toast").should(
      "contain",
      "standard shall have range of 1 - 12"
    );

    cy.get("#std").clear().type("5");
    cy.get("#name").type("12");
    cy.contains("button", "Create Student").click();
    cy.get(".Toastify__toast").should("contain", "invalid name");

    cy.get("#name").clear().type("gandhi");
    cy.get("#section").type("1");
    cy.contains("button", "Create Student").click();
    cy.get(".Toastify__toast").should("contain", "invalid section");

    cy.get("#section").clear().type("A");

    cy.contains("button", "Create Student").click();
    cy.wait("@createStudentRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.get(".Toastify__toast").should("contain", "student created");

    cy.get("#grNo").type("999");
    cy.get("#password").type("password");
    cy.get("#name").type("secondgandhi");
    cy.get("#section").type("A");
    cy.get("#std").type("1");

    cy.contains("button", "Create Student").click();
    cy.wait("@createStudentRequest")
      .its("response.statusCode")
      .should("eq", 400);
    cy.get(".Toastify__toast").should(
      "contain",
      "student already exist with gr number provided, try updating student details"
    );

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

    cy.contains("h4", "gandhi")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .last()
      .click();

    cy.wait("@deleteStudentRequest")
      .its("response.statusCode")
      .should("eq", 200);

    cy.get(".Toastify__toast").should("contain", "DELETED SUCCESSFULLY");
  });

  it("subject create - failure - invalid fields  - already present - limit unset", () => {
    cy.intercept("POST", "**/teacher/createSub*").as("createSubjectRequest");
    cy.intercept("DELETE", "**/teacher/delSubject*").as("deleteSubjectRequest");

    cy.get("#subjectsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

    cy.contains("a", "Create a new subject here").click();
    cy.location("pathname").should("eq", "/app/teacher/addSubject");

    cy.get("#subId").type("99");
    cy.get("#subName").type("Drawing");

    cy.contains("button", "Create Subject").click();
    cy.get(".Toastify__toast").should("contain", "Please fill all the fields");

    cy.get("#grade").type("14");
    cy.get("#credits").type("10");

    cy.contains("button", "Create Subject").click();
    cy.get(".Toastify__toast").should(
      "contain",
      "invalid grade. Allowed range is 1 - 12"
    );

    cy.get("#grade").clear().type("5");

    cy.contains("button", "Create Subject").click();
    cy.wait("@createSubjectRequest")
      .its("response.statusCode")
      .should("eq", 400);
    cy.get(".Toastify__toast").should(
      "contain",
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
    cy.get(".Toastify__toast").should("contain", "inserted successfully");

    cy.get("#subId").type("99");
    cy.get("#subName").type("DrawingSketch");
    cy.get("#grade").type("1");
    cy.get("#credits").type("10");

    cy.contains("button", "Create Subject").click();
    cy.wait("@createSubjectRequest")
      .its("response.statusCode")
      .should("eq", 400);
    cy.get(".Toastify__toast").should(
      "contain",
      "subject already exist with id provided, try updating subject details"
    );

    cy.contains("a", "Go back to veiw subject list").click();
    cy.location("pathname").should("eq", "/app/teacher/displaySubject");

    cy.contains("h4", "Drawing")
      .parents(".gridListContainer")
      .find(".editDelActionButtons")
      .children()
      .last()
      .click();

    cy.wait("@deleteSubjectRequest")
      .its("response.statusCode")
      .should("eq", 200);
    cy.get(".Toastify__toast").should("contain", "DELETED SUCCESSFULLY");
  });
});
