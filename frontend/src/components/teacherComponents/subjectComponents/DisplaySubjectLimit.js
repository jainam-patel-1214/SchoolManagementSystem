/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { fetchApi } from "../../../utils/fetchApiCode";
import { roleExtractor } from "../../../utils/roleExtractor";
import { ErrorToast } from "../../../utils/toasterCode";
import {
  TableComp,
  TableTdEntry,
  TableThEntry,
  TableTrEntry,
} from "../../helperComponents/GeneralTable";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
} from "../../../styled-components/HelperStyledComponents";
import { useNavigate } from "react-router-dom";

export const DisplaySubjectLimit = () => {
  const userrole = roleExtractor(window.location.pathname);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [keys, setKeys] = useState([]);
  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(`/${userrole}/allLimits`, "GET", {});
      if (res.output && typeof res.output !== "string") {
        setData();
        setData(res.output);
        setKeys(Object.keys(res.output[0]));
        return;
      }
    } catch (err) {
      ErrorToast(err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);
  return (
    <AllComponentsContainer>
      {isLoading ? (
        <></>
      ) : (
        <ContentContainers elements={"multiple"} style={{ marginTop: "1rem" }}>
          <TableComp
            style={{
              borderCollapse: "collapse",

              width: "100%",
              textAlign: "center",
            }}
          >
            <tbody>
              {keys.map((key, rowIndex) => (
                <TableTrEntry key={key}>
                  <TableThEntry>{key}</TableThEntry>
                  {data.map((item, colIndex) => (
                    <TableTdEntry
                      style={{ border: "1px solid black" }}
                      key={colIndex}
                    >
                      {item[key]}
                    </TableTdEntry>
                  ))}
                </TableTrEntry>
              ))}
            </tbody>
          </TableComp>
          {userrole === "admin" ? (
            <ButtonElement
              style={{ width: "50%", marginTop: "10px" }}
              bgcol={"default"}
              border={"default"}
              textcol={"default"}
              hovercol={"default"}
              type="submit"
              onClick={() => navigate(`/app/${userrole}/setSubjectLimit`)}
            >
              Go Back to set subject limit page
            </ButtonElement>
          ) : (
            <ButtonElement
              style={{ width: "50%", marginTop: "10px" }}
              bgcol={"default"}
              border={"default"}
              textcol={"default"}
              hovercol={"default"}
              type="submit"
              onClick={() => navigate(`/app/${userrole}/displaySubject`)}
            >
              Go Back
            </ButtonElement>
          )}
        </ContentContainers>
      )}
    </AllComponentsContainer>
  );
};
