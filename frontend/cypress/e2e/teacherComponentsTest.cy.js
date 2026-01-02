import "cypress-real-events/support";
describe("teacher components testing", () => {
  it("navigation of teacher's components", () => {
    cy.intercept("POST", "/login*").as("loginRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#userid").type("1").should("have.value", "1");

    cy.get("#password").type("password").should("have.value", "password");

    cy.get('select[name="userRole"]')
      .select("teacher")
      .should("have.value", "teacher");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

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
    cy.get("#signOutButton").click();
    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "Good Bye! Have a nice day");
    cy.url().should("include", "/signIn");
  });

  it("student create,edit,delete operation components in teacher - success", () => {
    cy.intercept("POST", "/login*").as("loginRequest");
    cy.intercept("POST", "**/teacher/createStud*").as("createStudentRequest");
    cy.intercept("PUT", "**/teacher/updateStud*").as("updateStudentRequest");
    cy.intercept("DELETE", "**/teacher/delStudent*").as("deleteStudentRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#userid").type("1").should("have.value", "1");

    cy.get("#password").type("password").should("have.value", "password");

    cy.get('select[name="userRole"]')
      .select("teacher")
      .should("have.value", "teacher");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get("#studentsTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

    cy.contains("a", "Create a new student here").click();
    cy.location("pathname").should("eq", "/app/teacher/addStudent");

    cy.get("#grNo").type("999").should("have.value", "999");
    cy.get("#password").type("password").should("have.value", "password");
    cy.get("#name").type("gandhi").should("have.value", "gandhi");
    cy.get("#section").type("A").should("have.value", "A");
    cy.get("#std").type("1").should("have.value", "1");

    cy.contains("button", "Create Student").click();
    cy.wait("@createStudentRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

    cy.contains("h4", "gandhi")
      .parent()
      .parent()
      .siblings(".gridListActions")
      .children(".editDelActionButtons")
      .children()
      .first()
      .click();
    cy.location("pathname").should("eq", "/app/teacher/editStudent/999");

    cy.get("#password")
      .clear()
      .type("NEW12password")
      .should("have.value", "NEW12password");
    cy.get("#name")
      .clear()
      .type("mahatmagandhi")
      .should("have.value", "mahatmagandhi");

    cy.contains("button", "Update Student").click();
    cy.wait("@updateStudentRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.contains("a", "Go back to veiw student list").click();
    cy.location("pathname").should("eq", "/app/teacher/displayStudent");

    cy.contains("h4", "gandhi")
      .parent()
      .parent()
      .siblings(".gridListActions")
      .children(".editDelActionButtons")
      .children()
      .last()
      .click();

    cy.wait("@deleteStudentRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });
    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "DELETED SUCCESSFULLY");
  });
});
