import { fetchApi } from "./fetchApiCode";
import getCookie from "./getCookie";

async function delCookie(...cname) {
  let finalResponse = null;

  for (const c of cname) {
    if (c === "token") {
      const tokenVal = getCookie(c);
      const obj = { token: tokenVal };
      try {
        const response = await fetchApi("/deleteCookieFromDB", "DELETE", obj);
        document.cookie = `${c}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
        if (!response.output) {
          const errText = await response.text();
          const temp = JSON.parse(errText).output;
          console.log("Server Error:", temp);
          finalResponse = { output: temp };
          continue;
        }
        finalResponse = response;
      } catch (e) {
        console.log(e);
        finalResponse = { output: "Network error" };
      }
    } else {
      document.cookie = `${c}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
    }
  }
  return finalResponse;
}
export default delCookie;
