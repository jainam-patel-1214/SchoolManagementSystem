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
