export const roleExtractor = (url) => {
  const role = url.split("/")[2];
  if (role === "student" || role === "teacher" || role === "admin") {
    return role;
  }
  throw new Error("Invalid role in URL");
};
