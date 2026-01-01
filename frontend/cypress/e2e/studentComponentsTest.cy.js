import "cypress-real-events/support";

describe("Student components test", () => {
  it("checks student result - success", () => {
    cy.intercept("POST", "/login*").as("loginRequest");
    cy.intercept("GET", "**/student/display*").as("fetchResult");

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

    cy.url().should("match", /\/app\/student/);

    cy.get("#schoolResulyBtn").click();

    cy.url().should("match", /\/app\/student\/schoolResult/);

    cy.get("#std").type("1").should("have.value", "1");

    cy.get("#fetchResultButton").click();
    cy.wait("@fetchResult").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast").should("be.visible").and("contain", "Success!!");
  });
  it("checks student result - success (with all filters)", () => {
    cy.intercept("POST", "/login*").as("loginRequest");
    cy.intercept("GET", "**/student/display*").as("fetchResult");

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

    cy.url().should("match", /\/app\/student/);

    cy.get("#schoolResulyBtn").click();

    cy.url().should("match", /\/app\/student\/schoolResult/);

    cy.get("#std").type("1").should("have.value", "1");
    cy.get("#section").type("C").should("have.value", "C");
    cy.get("#minPercent").type("80").should("have.value", "80");

    cy.get("#fetchResultButton").click();
    cy.wait("@fetchResult").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast").should("be.visible").and("contain", "Success!!");
  });
  it("checks student result - error", () => {
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

    cy.url().should("match", /\/app\/student/);

    cy.get("#schoolResulyBtn").click();

    cy.url().should("match", /\/app\/student\/schoolResult/);

    cy.get("#std").type("13").should("have.value", "13");

    cy.get("#fetchResultButton").click();

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and(
        "contain",
        "Grade/Std not allowed shall be between 1 and 12 inclusive"
      );
  });
  it("checks student result - success but no result", () => {
    cy.intercept("POST", "/login*").as("loginRequest");
    cy.intercept("GET", "**/student/display*").as("fetchResult");

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

    cy.url().should("match", /\/app\/student/);

    cy.get("#schoolResulyBtn").click();

    cy.url().should("match", /\/app\/student\/schoolResult/);

    cy.get("#std").type("1").should("have.value", "1");
    cy.get("#minPercent").type("99").should("have.value", "99");

    cy.get("#fetchResultButton").click();
    cy.wait("@fetchResult").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "no result found");
  });
  it("going back from school result page to profile page", () => {
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

    cy.location("pathname").should("eq", "/app/student");

    cy.get("#schoolResulyBtn").click();

    cy.location("pathname").should("eq", "/app/student/schoolResult");

    cy.get("#profileTab").realHover();
    cy.get("#subTabsContainer").should("be.visible");
    cy.get("#navigateToAccountBtn").click();

    cy.url().should("match", /\/app\/student/);
  });
});
