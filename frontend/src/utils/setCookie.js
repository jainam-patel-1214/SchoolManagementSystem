export const CookieSetter = (id, name, token, role) => {
  const now = new Date();
  let timenow = now.getTime();
  timenow += 86340000;
  now.setTime(timenow);
  document.cookie = `userid=${id}; expires=${now.toUTCString()}; path=/`;
  document.cookie = `username=${name}; expires=${now.toUTCString()}; path=/`;
  document.cookie = `token=${token}; expires=${now.toUTCString()}; path=/`;
  document.cookie = `role=${role}; expires=${now.toUTCString()}; path=/`;
};
