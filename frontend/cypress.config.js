import { defineConfig } from "cypress";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      on("task", {
        readUser() {
          const filePath = resolve(
            __dirname,
            "cypress/fixtures/adminTestUser.json"
          );

          if (!existsSync(filePath)) return null;

          const data = readFileSync(filePath, "utf8");
          return data ? JSON.parse(data) : null;
        },

        saveUser(user) {
          const filePath = resolve(
            __dirname,
            "cypress/fixtures/adminTestUser.json"
          );

          writeFileSync(filePath, JSON.stringify(user, null, 2));
          return null;
        },
        clearUser() {
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
