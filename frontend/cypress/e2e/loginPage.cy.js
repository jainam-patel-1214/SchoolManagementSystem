// describe("template spec", () => {
//   it("passes", () => {
//     cy.visit("http://localhost:3000/");
//   });
// });
describe("Login Form - Scholar App", () => {
  it("fills form and logs in failure as input fields are invalid", () => {
    cy.intercept("POST", "http://localhost:8090/login").as("loginRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#userid").type("12345").should("have.value", "12345");

    cy.get("#password").type("Tt@123").should("have.value", "Tt@123");

    cy.get('select[name="userRole"]')
      .select("student")
      .should("have.value", "student");

    cy.get('button[type="submit"]').click();

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "please enter an 8-16 digit password");
  });
  it("fills form and logs in failure for student", () => {
    cy.intercept("POST", "http://localhost:8090/login").as("loginRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#userid").type("12345").should("have.value", "12345");

    cy.get("#password").type("Test@123").should("have.value", "Test@123");

    cy.get('select[name="userRole"]')
      .select("student")
      .should("have.value", "student");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(401);
    });
  });
  it("fills form and logs in failure for teacher", () => {
    cy.intercept("POST", "http://localhost:8090/login").as("loginRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#userid").type("12345").should("have.value", "12345");

    cy.get("#password").type("Test@123").should("have.value", "Test@123");

    cy.get('select[name="userRole"]')
      .select("teacher")
      .should("have.value", "teacher");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(401);
    });
  });
  it("fills form and logs in failure for admin", () => {
    cy.intercept("POST", "http://localhost:8090/login").as("loginRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#userid").type("12345").should("have.value", "12345");

    cy.get("#password").type("Test@123").should("have.value", "Test@123");

    cy.get('select[name="userRole"]')
      .select("admin")
      .should("have.value", "admin");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest").then((interception) => {
      console.log(interception.response);
      expect(interception.response.statusCode).to.eq(401);
    });
  });
  it("fills form and logs in success for student", () => {
    cy.intercept("POST", "/login*").as("loginRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#userid").type("1").should("have.value", "1");

    cy.get("#password").type("passwordh").should("have.value", "passwordh");

    cy.get('select[name="userRole"]')
      .select("student")
      .should("have.value", "student");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.url().should("match", /\/app\/(student|teacher|admin)/);

    cy.get("#signOutButton").click();
    cy.url().should("include", "/login");
  });
  it("fills form and logs in success for teacher", () => {
    cy.visit("http://localhost:3000/");
    cy.intercept("POST", "/login*").as("loginRequest");
    cy.get("#userid").type("1").should("have.value", "1");

    cy.get("#password").type("password").should("have.value", "password");

    cy.get('select[name="userRole"]')
      .select("teacher")
      .should("have.value", "teacher");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.url().should("match", /\/app\/(student|teacher|admin)/);

    cy.get("#signOutButton").click();

    cy.url().should("include", "/login");
  });
  it("fills form and logs in success for admin", () => {
    cy.intercept("POST", "http://localhost:8090/login").as("loginRequest");

    cy.visit("http://localhost:3000/");

    cy.get("#userid").type("1").should("have.value", "1");

    cy.get("#password").type("password").should("have.value", "password");

    cy.get('select[name="userRole"]')
      .select("admin")
      .should("have.value", "admin");

    cy.get('button[type="submit"]').click();

    cy.wait("@loginRequest").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.url().should("match", /\/app\/(student|teacher|admin)/);

    cy.get("#signOutButton").click();

    cy.url().should("include", "/login");
  });
});
