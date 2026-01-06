import "cypress-real-events/support";
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
Cypress.Commands.add("registerWithApiCredentials", (role) => {
  cy.task("readUser").then((storedUser) => {
    if (!storedUser || !storedUser.id) {
      cy.request({
        method: "POST",
        url: "http://localhost:8090/register",
        body: {
          yourName: "testUser",
          password: "password",
          roleReq: role,
          secretK: "wwww8AxndfnaA82JWAxr2.apFmJkU.1ROK10HmFBf69KxSCtW7S",
        },
      }).then((res) => {
        expect(res.status).to.eq(200);

        const user = {
          id: res.body.uid,
          password: res.body.upwd,
          role,
        };

        cy.task("saveUser", user);
        Cypress.env("user", user);
        cy.loginViaUI(user);
      });
    } else {
      Cypress.env("user", storedUser);
      cy.loginViaUI(storedUser);
    }
  });
});

Cypress.Commands.add("loginViaUI", ({ id, password, role }) => {
  cy.intercept("POST", "/login*").as("loginRequest");

  cy.visit("http://localhost:3000/");

  cy.get("#userid").type(String(id));
  cy.get("#password").type(password);
  cy.get('select[name="userRole"]').select(role);

  cy.get('button[type="submit"]').click();

  cy.wait("@loginRequest").its("response.statusCode").should("eq", 200);
});

Cypress.Commands.add("expectAndCloseToast", (text) => {
  cy.contains(".Toastify__toast", text)
    .should("be.visible")
    .within(() => {
      cy.get(".Toastify__close-button").click();
    });
  cy.get(".Toastify__toast").should("not.exist");
});

Cypress.Commands.add("createDemoStudentUser", () => {
  cy.intercept("POST", "**/teacher/createStud*").as("createStudentRequest");
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
  cy.wait("@createStudentRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("student created");
});

Cypress.Commands.add("deleteDemoStudentUser", () => {
  cy.intercept("DELETE", "**/teacher/delStudent*").as("deleteStudentRequest");
  cy.get("#studentsTabBtn").click();
  cy.location("pathname").should("eq", "/app/teacher/displayStudent");

  cy.contains("h4", "gandhi")
    .parents(".gridListContainer")
    .find(".editDelActionButtons")
    .children()
    .last()
    .click();

  cy.wait("@deleteStudentRequest").its("response.statusCode").should("eq", 200);

  cy.expectAndCloseToast("DELETED SUCCESSFULLY");
});

Cypress.Commands.add("createDemoSubject", () => {
  cy.intercept("POST", "**/teacher/createSub*").as("createSubjectRequest");

  cy.get("#subjectsTabBtn").click();
  cy.location("pathname").should("eq", "/app/teacher/displaySubject");

  cy.contains("a", "Create a new subject here").click();
  cy.location("pathname").should("eq", "/app/teacher/addSubject");

  cy.get("#subId").type("99");
  cy.get("#subName").type("Drawing");
  cy.get("#grade").type("1");
  cy.get("#credits").type("10");

  cy.contains("button", "Create Subject").click();
  cy.wait("@createSubjectRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("inserted successfully");
});

Cypress.Commands.add("deleteDemoSubject", () => {
  cy.intercept("DELETE", "**/teacher/delSubject*").as("deleteSubjectRequest");

  cy.get("#subjectsTabBtn").click();
  cy.location("pathname").should("eq", "/app/teacher/displaySubject");

  cy.contains("h4", "Drawing")
    .parents(".gridListContainer")
    .find(".editDelActionButtons")
    .children()
    .last()
    .click();

  cy.wait("@deleteSubjectRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("DELETED SUCCESSFULLY");
});

Cypress.Commands.add("createDemoReview", () => {
  cy.intercept("POST", "**/teacher/addReview*").as("createReviewRequest");
  cy.createDemoStudentUser();

  cy.get("#profileTab").realHover();
  cy.get("#reviewTabBtn").click();
  cy.location("pathname").should("eq", "/app/teacher/reviews");

  cy.get("#grNo").type("999");
  cy.contains("button", "Search").click();
  cy.expectAndCloseToast("Student Exists you wish to give review, go on!!");

  cy.get("#comment").type("good boy che aa manas");

  cy.contains("button", "Add Review").click();
  cy.wait("@createReviewRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("added successfully");

  cy.deleteDemoStudentUser();
});
