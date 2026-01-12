/* eslint-disable no-undef */
import "cypress-real-events/support";

beforeEach(() => {
  const user = { id: 99091, password: "password", role: "student" };

  cy.session(String(user.id), () => {
    cy.loginViaUI(user);
  });
  cy.visit("http://localhost:3000/app/student");
});

describe("Student components test", () => {
  it("checks student result - success", () => {
    cy.intercept("GET", "**/student/display*").as("fetchResult");
    cy.get("#schoolResultBtn").click();

    cy.url().should("match", /\/app\/student\/schoolResult/);

    cy.get("#std").type("1").should("have.value", "1");

    cy.get("#fetchResultButton").click();
    cy.wait("@fetchResult").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast").should("be.visible").and("contain", "Success!!");
  });
  it("checks student result - success (with all filters)", () => {
    cy.intercept("GET", "**/student/display*").as("fetchResult");

    cy.get("#schoolResultBtn").click();

    cy.url().should("match", /\/app\/student\/schoolResult/);

    cy.get("#std").type("1").should("have.value", "1");
    cy.get("#section").type("A").should("have.value", "A");
    cy.get("#minPercent").type("80").should("have.value", "80");

    cy.get("#fetchResultButton").click();
    cy.wait("@fetchResult").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast").should("be.visible").and("contain", "Success!!");
  });
  it("checks student result - error", () => {
    cy.visit("http://localhost:3000/");

    cy.get("#schoolResultBtn").click();

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
    cy.intercept("GET", "**/student/display*").as("fetchResult");

    cy.get("#schoolResultBtn").click();

    cy.url().should("match", /\/app\/student\/schoolResult/);

    cy.get("#std").type("1").should("have.value", "1");
    cy.get("#minPercent").clear().type("1").should("have.value", "1");
    cy.get("#maxPercent").clear().type("20").should("have.value", "20");

    cy.get("#fetchResultButton").click();
    cy.wait("@fetchResult").then((interception) => {
      expect(interception.response.statusCode).to.eq(200);
    });

    cy.get(".Toastify__toast")
      .should("be.visible")
      .and("contain", "no result found");
  });
  it("going back from school result page to profile page", () => {
    cy.location("pathname").should("eq", "/app/student");

    cy.get("#schoolResultBtn").click();

    cy.location("pathname").should("eq", "/app/student/schoolResult");

    cy.get("#profileTab").realHover();
    cy.get("#navigateToAccountBtn").click();

    cy.url().should("match", /\/app\/student/);
  });
});
