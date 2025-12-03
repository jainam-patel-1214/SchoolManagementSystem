export const FetchApi = async (url, methodtype, bodyObj) => {
    const fetchParams = {
        method: methodtype,
        credentials: 'include'
    };

    if (methodtype !== "GET") {
        fetchParams.headers = { "Content-Type": "application/json" };
        fetchParams.body = JSON.stringify(bodyObj);
    }
    const resp = await fetch(url, fetchParams);
    const data = await resp.json();
    console.log(data);

    if (!resp.ok) {
        throw data.error;
    }

    return data;
};
