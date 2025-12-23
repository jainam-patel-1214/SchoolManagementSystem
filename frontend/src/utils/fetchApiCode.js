export const fetchApi = async (url, methodtype, bodyObj) => {
  const fetchParams = {
    method: methodtype,
    credentials: "include",
  };

  if (methodtype !== "GET") {
    fetchParams.headers = { "Content-Type": "application/json" };
    fetchParams.body = JSON.stringify(bodyObj);
  }
  const resp = await fetch(url, fetchParams);
  const data = await resp.json();
  // console.log(data);

  if (!resp.ok) {
    console.log(new Error(data.error));
    throw data.error;
  }

  return data;
};

export const fetchUrlParams = (key) => {
  const urlParams = new URLSearchParams(window.location.search);
  const value = urlParams.get(key);
  if (value) {
    return value;
  }
};
