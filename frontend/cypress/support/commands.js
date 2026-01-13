/* eslint-disable no-undef */
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
  //   if (role === "admin") {
  // } else cy.task("clearUserTeacher");
  if (role === "admin") {
    cy.registerFunctionHelper(
      "admin",
      "readUserAdmin",
      "clearUserAdmin",
      "saveUserAdmin"
    );
    // cy.task("clearUserAdmin");
    // cy.task("readUser").then((storedUser) => {
    //   if (!storedUser || !storedUser.id) {
    //     cy.request({
    //       method: "POST",
    //       url: "http://localhost:8090/register",
    //       body: {
    //         yourName: "testUser",
    //         password: "password",
    //         roleReq: "admin",
    //         secretK: "wwww8AxndfnaA82JWAxr2.apFmJkU.1ROK10HmFBf69KxSCtW7S",
    //       },
    //     }).then((res) => {
    //       expect(res.status).to.eq(200);

    //       const user = {
    //         id: res.body.uid,
    //         password: res.body.upwd,
    //         role,
    //       };
    //       cy.task("saveUserAdmin", user);
    //       Cypress.env("user", user);
    //       cy.loginViaUI(user);
    //       cy.visit("http://localhost:3000/app/admin");
    //       cy.getCookies().then((cookies) => {
    //         const cookieHeader = cookies
    //           .map((c) => `${c.name}=${c.value}`)
    //           .join("; ");

    //         cy.request({
    //           method: "GET",
    //           url: "http://localhost:8090/admin/removeDummyData",
    //           headers: {
    //             Cookie: cookieHeader,
    //           },
    //         }).then((res) => {
    //           expect(res.status).to.eq(200);
    //         });
    //       });
    //     });
    //   } else {
    //     Cypress.env("user", storedUser);
    //     cy.loginViaUI(storedUser);
    //   }
    // });
  } else {
    cy.registerFunctionHelper(
      "teacher",
      "readUserTeacher",
      "clearUserTeacher",
      "saveUserTeacher"
    );
  }
});

Cypress.Commands.add(
  "registerFunctionHelper",
  (role, reader, cleaner, fileSaver) => {
    cy.task(cleaner);
    cy.task(reader).then((storedUser) => {
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
          cy.task(fileSaver, user);
          Cypress.env("user", user);
          cy.loginViaUI(user);
          cy.visit("http://localhost:3000/app/admin");
          if (role === "admin") {
            cy.getCookies().then((cookies) => {
              const cookieHeader = cookies
                .map((c) => `${c.name}=${c.value}`)
                .join("; ");

              cy.request({
                method: "GET",
                url: "http://localhost:8090/admin/removeDummyData",
                headers: {
                  Cookie: cookieHeader,
                },
              }).then((res) => {
                expect(res.status).to.eq(200);
              });
            });
          }
        });
      } else {
        Cypress.env("user", storedUser);
        cy.loginViaUI(storedUser);
      }
    });
  }
);

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

Cypress.Commands.add("createDemoStudentUser", (role) => {
  cy.intercept("POST", `**/${role}/createStud*`).as("createStudentRequest");
  cy.get("#studentsTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displayStudent`);

  cy.contains("a", "Create a new student here").click();
  cy.location("pathname").should("eq", `/app/${role}/addStudent`);
  cy.get("#grNo").type("999");
  cy.get("#password").type("password");
  cy.get("#name").type("gandhi");
  cy.get("#section").type("A");
  cy.get("#std").type("1");

  cy.contains("button", "Create Student").click();
  cy.wait("@createStudentRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("student created");
});

Cypress.Commands.add("deleteDemoStudentUser", (role) => {
  cy.intercept("DELETE", `**/${role}/delStudent*`).as("deleteStudentRequest");
  cy.get("#studentsTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displayStudent`);

  cy.contains("h4", "gandhi")
    .parents(".gridListContainer")
    .find(".editDelActionButtons")
    .children()
    .last()
    .click();

  cy.wait("@deleteStudentRequest").its("response.statusCode").should("eq", 200);

  cy.expectAndCloseToast("DELETED SUCCESSFULLY");
});

Cypress.Commands.add("createDemoSubject", (role) => {
  cy.intercept("POST", `**/${role}/createSub*`).as("createSubjectRequest");

  cy.get("#subjectsTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displaySubject`);

  cy.contains("a", "Create a new subject here").click();
  cy.location("pathname").should("eq", `/app/${role}/addSubject`);

  cy.get("#subId").type("99");
  cy.get("#subName").type("Drawing");
  cy.get("#grade").type("1");
  cy.get("#credits").type("10");

  cy.contains("button", "Create Subject").click();
  cy.wait("@createSubjectRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("inserted successfully");
});

Cypress.Commands.add("deleteDemoSubject", (role) => {
  cy.intercept("DELETE", `**/${role}/delSubject*`).as("deleteSubjectRequest");

  cy.get("#subjectsTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displaySubject`);

  cy.contains("h4", "Drawing")
    .parents(".gridListContainer")
    .find(".editDelActionButtons")
    .children()
    .last()
    .click();

  cy.wait("@deleteSubjectRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("DELETED SUCCESSFULLY");
});

Cypress.Commands.add("createDemoReview", (role) => {
  cy.intercept("POST", `**/${role}/addReview*`).as("createReviewRequest");
  cy.createDemoStudentUser(role);

  cy.get("#profileTab").realHover();
  cy.get("#reviewTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/reviews`);

  cy.get("#grNo").type("999");
  cy.contains("button", "Search").click();
  cy.expectAndCloseToast("Student Exists you wish to give review, go on!!");

  cy.get("#comment").type("good boy che aa manas");

  cy.contains("button", "Add Review").click();
  cy.wait("@createReviewRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("added successfully");

  cy.deleteDemoStudentUser(role);
});

Cypress.Commands.add("createDemoTeacherUser", (role) => {
  cy.intercept("POST", `**/${role}/addTeacher*`).as("createTeacher");

  cy.get("#teacherTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displayTeacher`);

  cy.contains("a", "Create a new teacher here").click();
  cy.location("pathname").should("eq", `/app/${role}/addTeacher`);

  cy.get("#tid").type("999");
  cy.get("#tname").type("TempTeacherUser");
  cy.get("#password").type("tpassword");

  cy.contains("button", "Create Teacher").click();
  cy.wait("@createTeacher").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("ADDED SUCCESSFULLY");
});

Cypress.Commands.add("deleteDemoTeacherUser", (role) => {
  cy.intercept("DELETE", `**/${role}/delTeacher*`).as("deleteTeacher");

  cy.get("#teacherTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displayTeacher`);

  cy.contains("h4", "TempTeacherUser")
    .parents(".gridListContainer")
    .find(".editDelActionButtons")
    .children()
    .last()
    .click();

  cy.wait("@deleteTeacher").its("response.statusCode").should("eq", 200);

  cy.expectAndCloseToast("DELETED SUCCESSFULLY");
});

Cypress.Commands.add("registerTemporaryUser", (role) => {
  cy.intercept("POST", "**/register*").as("registerRequest");

  cy.visit("http://localhost:3000");

  cy.get("#switchToSignup").click();
  cy.location("pathname").should("eq", "/signup");

  cy.get("#username").type("TestDemoUser").should("have.value", "TestDemoUser");

  cy.get("#password").type("password12").should("have.value", "password12");

  cy.get('select[name="userRole"]').select(role).should("have.value", role);

  cy.get('button[type="submit"]').click();

  cy.wait("@registerRequest").then((interception) => {
    expect(interception.response.statusCode).to.eq(200);
  });
  cy.expectAndCloseToast("registeration request submitted");
});

Cypress.Commands.add(
  "findAcceptRejectButton",
  (userName, userRole, buttonClass) => {
    cy.get(".user-name")
      .contains(userName)
      .parent()
      .siblings()
      .children(".user-role")
      .contains(userRole)
      .parent()
      .siblings()
      .children(buttonClass)
      .click();
  }
);

Cypress.Commands.add(
  "fillAcceptPopupDetails",
  (userId, userStd, userSection, role) => {
    cy.intercept("POST", "**/admin/acceptRequest*").as("acceptPendingRequest");
    cy.get("#furtherDetailsPopoupContainer").should("be.visible");
    switch (role) {
      case "student":
        cy.get("#uid").type(userId).should("have.value", userId);
        cy.get("#std").type(userStd).should("have.value", userStd);
        cy.get("#section").type(userSection).should("have.value", userSection);
        cy.contains("button", "Submit").click();
        cy.wait("@acceptPendingRequest")
          .its("response.statusCode")
          .should("eq", 200);
        cy.expectAndCloseToast("student created");
        break;
      case "teacher":
        cy.get("#uid").type(userId).should("have.value", userId);
        cy.contains("button", "Submit").click();
        cy.wait("@acceptPendingRequest")
          .its("response.statusCode")
          .should("eq", 200);
        cy.expectAndCloseToast("teacher created");
        break;
      case "admin":
        cy.get("#uid").type(userId).should("have.value", userId);
        cy.contains("button", "Submit").click();
        cy.wait("@acceptPendingRequest")
          .its("response.statusCode")
          .should("eq", 200);
        cy.expectAndCloseToast("admin created");
        break;

      default:
        break;
    }
  }
);

Cypress.Commands.add("deleteParticularTeacher", (role, name) => {
  cy.intercept("DELETE", `**/${role}/delTeacher*`).as("deleteTeacher");

  cy.get("#teacherTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displayTeacher`);

  cy.contains("h4", name)
    .first()
    .parents(".gridListContainer")
    .find(".editDelActionButtons")
    .children()
    .last()
    .click();

  cy.wait("@deleteTeacher").its("response.statusCode").should("eq", 200);

  cy.expectAndCloseToast("DELETED SUCCESSFULLY");
});

Cypress.Commands.add("deleteParticularStudent", (role, name) => {
  cy.intercept("DELETE", `**/${role}/delStudent*`).as("deleteStudentRequest");
  cy.get("#studentsTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displayStudent`);

  cy.contains("h4", name)
    .first()
    .parents(".gridListContainer")
    .find(".editDelActionButtons")
    .children()
    .last()
    .click();

  cy.wait("@deleteStudentRequest").its("response.statusCode").should("eq", 200);

  cy.expectAndCloseToast("DELETED SUCCESSFULLY");
});

Cypress.Commands.add("createSubject", (role, id, name, grade, credits) => {
  cy.intercept("POST", `**/${role}/createSub*`).as("createSubjectRequest");

  cy.get("#subjectsTabBtn").click();
  cy.location("pathname").should("eq", `/app/${role}/displaySubject`);

  cy.contains("a", "Create a new subject here").click();
  cy.location("pathname").should("eq", `/app/${role}/addSubject`);

  cy.get("#subId").type(id);
  cy.get("#subName").type(name);
  cy.get("#grade").type(grade);
  cy.get("#credits").type(credits);

  cy.contains("button", "Create Subject").click();
  cy.wait("@createSubjectRequest").its("response.statusCode").should("eq", 200);
  cy.expectAndCloseToast("inserted successfully");
});

Cypress.Commands.add(
  "createStudent",
  (role, id, password, name, grade, section) => {
    cy.intercept("POST", `**/${role}/createStud*`).as("createStudentRequest");
    cy.get("#studentsTabBtn").click();
    cy.location("pathname").should("eq", `/app/${role}/displayStudent`);

    cy.contains("a", "Create a new student here").click();
    cy.location("pathname").should("eq", `/app/${role}/addStudent`);
    cy.get("#grNo").type(id);
    cy.get("#password").type(password);
    cy.get("#name").type(name);
    cy.get("#section").type(section);
    cy.get("#std").type(grade);

    cy.contains("button", "Create Student").click();
    cy.wait("@createStudentRequest").then((interception) => {
      const status = interception.response.statusCode;

      expect([200, 400]).to.include(status);

      if (status === 200) {
        cy.expectAndCloseToast("student created");
      } else {
        cy.expectAndCloseToast(
          "student already exist with gr number provided, try updating student details"
        );
      }
    });
  }
);

Cypress.Commands.add(
  "insertMarks",
  (grNo, subId, theoryMark, practicalMark, role) => {
    cy.intercept("POST", `**/${role}/enterMarks*`).as(
      "createMarkRecordRequest"
    );
    cy.get("#subId").clear().type(subId);
    cy.get("#grNo").clear().type(grNo);
    cy.get("#theory").clear().type(theoryMark);
    cy.get("#practical").clear().type(practicalMark);
    cy.contains("button", "Submit Marks").click();
    cy.wait("@createMarkRecordRequest").then((interception) => {
      const status = interception.response.statusCode;

      expect([200, 400]).to.include(status);

      if (status === 200) {
        cy.expectAndCloseToast("inserted successfully");
      } else {
        cy.expectAndCloseToast(
          "subject already exist with id provided, try updating subject details"
        );
      }
    });
  }
);
Cypress.Commands.add("initialDataForStudentAndTeacher", (role) => {
  if (role === "admin") {
    cy.intercept("POST", "**/admin/setSubLimit*").as("setSubjectLimitRequest");

    cy.get("#subjectsTabBtn").click();
    cy.location("pathname").should("eq", `/app/admin/displaySubject`);

    cy.contains("a", "Set subject limit here").click();
    cy.location("pathname").should("eq", `/app/admin/setSubjectLimit`);

    cy.get("#std").clear().type("1");
    cy.get("#limit").clear().type("10");

    cy.contains("button", "Set Limit").click();
    cy.wait("@setSubjectLimitRequest").then((interception) => {
      const status = interception.response.statusCode;

      expect([200, 400]).to.include(status);

      if (status === 200) {
        cy.expectAndCloseToast("limit set successfully");
      } else {
        cy.expectAndCloseToast("limit already set, cannot reset it");
      }
    });

    // cy.createSubject("admin", "99090", "Physics", "1", "10");
    // cy.createStudent("admin", "99091", "password", "StudentA", "1", "A");
    // cy.createStudent("admin", "99092", "password", "StudentB", "1", "B");
    // cy.createStudent("admin", "99093", "password", "StudentC", "1", "C");

    // cy.get("#marksTabBtn").click();
    // cy.location("pathname").should("eq", "/app/admin/enterMarks");
    // cy.insertMarks("99091", "99090", "80", "20", "admin");
    // cy.insertMarks("99092", "99090", "70", "10","admin");
    // cy.insertMarks("99093", "99090", "20", "2","admin");
  } else {
    cy.createSubject("teacher", "99090", "Physics", "1", "10");
    cy.createStudent("teacher", "99091", "password", "StudentA", "1", "A");
    cy.createStudent("teacher", "99092", "password", "StudentB", "1", "B");
    cy.createStudent("teacher", "99093", "password", "StudentC", "1", "C");

    cy.get("#marksTabBtn").click();
    cy.location("pathname").should("eq", "/app/teacher/enterMarks");
    cy.insertMarks("99091", "99090", "80", "20", "teacher");
    cy.insertMarks("99092", "99090", "70", "10", "teacher");
    cy.insertMarks("99093", "99090", "20", "2", "teacher");
  }
});
