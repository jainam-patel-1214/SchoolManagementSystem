import { defineConfig } from "cypress";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        readUserAdmin() {
          const filePath = resolve(
            __dirname,
            "cypress/fixtures/adminTestUser.json"
          );

          if (!existsSync(filePath)) return null;

          const data = readFileSync(filePath, "utf8");
          return data ? JSON.parse(data) : null;
        },
        readUserTeacher() {
          const filePath = resolve(__dirname, "cypress/fixtures/testUser.json");

          if (!existsSync(filePath)) return null;

          const data = readFileSync(filePath, "utf8");
          return data ? JSON.parse(data) : null;
        },

        saveUserAdmin(user) {
          const filePath = resolve(
            __dirname,
            "cypress/fixtures/adminTestUser.json"
          );

          writeFileSync(filePath, JSON.stringify(user, null, 2));
          return null;
        },
        saveUserTeacher(user) {
          const filePath = resolve(__dirname, "cypress/fixtures/testUser.json");

          writeFileSync(filePath, JSON.stringify(user, null, 2));
          return null;
        },
        clearUserTeacher() {
          const filePath = resolve(__dirname, "cypress/fixtures/testUser.json");
          if (!existsSync(filePath)) return false;

          writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
          return true;
        },
        clearUserAdmin() {
          const filePath = resolve(
            __dirname,
            "cypress/fixtures/adminTestUser.json"
          );
          if (!existsSync(filePath)) return false;

          writeFileSync(filePath, JSON.stringify({}, null, 2), "utf8");
          return true;
        },
      });
    },
  },
});
