import getCookie from "./getCookie"

async function delCookie(...cname) {
    let finalResponse = null;

    for (const c of cname) {
        if (c === "token") {
            const tokenVal = getCookie(c)
            console.log("token val to del", tokenVal);
            const obj = { token: tokenVal }
            try {
                const response = await fetch("http://localhost:8090/deleteCookieFromDB", {
                    method: "DELETE",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(obj)
                })
                if (!response.ok) {
                    const errText = await response.text();
                    const temp = JSON.parse(errText).output;
                    console.log("Server Error:", temp);
                    finalResponse = { output: temp };
                    continue
                }

                const res = await response.json()
                console.log(res)
                finalResponse = res
            } catch (e) {
                console.log(e);
                finalResponse = { output: "Network error" }
            }
        }
    }
    deleteCookie(cname)
    return finalResponse
}
export default delCookie

function deleteCookie(arr) {
    arr.forEach(a => {
        console.log(a);
        document.cookie = `${a}=; expires=Thu, 01-Jan-70 00:00:01 GMT;`
    })
}