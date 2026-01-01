describe("Register Form - Scholar App", () => {
  it("fills form and signup failure for student", () => {
    cy.visit("http://localhost:3000/");

    cy.get("#switchToSignup").click();

    cy.get("#username").type("hello").should("have.value", "hello");

    cy.get("#password").type("Te@123").should("have.value", "Te@123");

    cy.get('select[name="userRole"]')
      .select("student")
      .should("have.value", "student");

    cy.get('button[type="submit"]').click();

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "please enter an 8 digit password");
  });
  it("fills form and signup failure for teacher", () => {
    cy.intercept("POST", "**/register*").as("registerRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#switchToSignup").click();

    cy.get("#username").type("hello").should("have.value", "hello");

    cy.get("#password").type("Te@123").should("have.value", "Te@123");

    cy.get('select[name="userRole"]')
      .select("teacher")
      .should("have.value", "teacher");

    cy.get('button[type="submit"]').click();
    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "please enter an 8 digit password");
  });
  it("fills form and signup failure for admin", () => {
    cy.intercept("POST", "**/register*").as("registerRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#switchToSignup").click();

    cy.get("#username").type("hello").should("have.value", "hello");

    cy.get("#password").type("Test@123").should("have.value", "Test@123");

    cy.get('button[type="submit"]').click();

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "pick a role for yourself to register with");
  });
  it("fills form and signup success for student", () => {
    cy.intercept("POST", "**/register*").as("registerRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#switchToSignup").click();

    cy.get("#username")
      .type("cypressstudent")
      .should("have.value", "cypressstudent");

    cy.get("#password").type("password12").should("have.value", "password12");

    cy.get('select[name="userRole"]')
      .select("student")
      .should("have.value", "student");

    cy.get('button[type="submit"]').click();

    cy.wait("@registerRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "registeration request submitted");
  });
  it("fills form and signup success for teacher", () => {
    cy.visit("http://localhost:3000/");
    cy.intercept("POST", "**/register*").as("registerRequest");

    cy.get("#switchToSignup").click();

    cy.get("#username")
      .type("cypressteacher")
      .should("have.value", "cypressteacher");

    cy.get("#password").type("password").should("have.value", "password");

    cy.get('select[name="userRole"]')
      .select("teacher")
      .should("have.value", "teacher");

    cy.get('button[type="submit"]').click();

    cy.wait("@registerRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "registeration request submitted");
  });
  it("fills form and signup success for admin", () => {
    cy.intercept("POST", "**/register*").as("registerRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#switchToSignup").click();

    cy.get("#username")
      .type("cypressadmin")
      .should("have.value", "cypressadmin");

    cy.get("#password").type("password").should("have.value", "password");

    cy.get('select[name="userRole"]')
      .select("admin")
      .should("have.value", "admin");

    cy.get('button[type="submit"]').click();

    cy.wait("@registerRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "registeration request submitted");
  });
});
