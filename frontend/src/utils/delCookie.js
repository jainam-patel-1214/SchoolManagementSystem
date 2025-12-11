import { fetchApi } from "./fetchApi";
import getCookie from "./getCookie"

async function delCookie(...cname) {
    let finalResponse = null;

    for (const c of cname) {
        if (c === "token") {
            const tokenVal = getCookie(c)
            const obj = { token: tokenVal }
            try {
                const response = await fetchApi("http://localhost:8090/deleteCookieFromDB","DELETE",obj)
                document.cookie = `${c}=; expires=Thu, 01-Jan-70 00:00:01 GMT;`
                if (!response.output) {
                    const errText = await response.text();
                    const temp = JSON.parse(errText).output;
                    console.log("Server Error:", temp);
                    finalResponse = { output: temp };
                    continue
                }
                finalResponse = response
            } catch (e) {
                console.log(e);
                finalResponse = { output: "Network error" }
            }
        }else{
            document.cookie = `${c}=; expires=Thu, 01-Jan-70 00:00:01 GMT;`
        }
    }
    return finalResponse
}
export default delCookie
