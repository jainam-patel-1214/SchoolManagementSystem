import styled from "styled-components";
import { useState, useEffect } from "react";
import { StudentHomeSection, StudentInfo } from "../studentComponents/Home";
import { ToastContainer } from "react-toastify";
import { StyledNavbar } from "../../styled-components/StyledNav";
import imgpfp from "../../assets/pfp.webp";
import { ErrorToast } from "../../utils/toasterCode";
import { roleExtractor } from "../../utils/roleExtractor";
import { fetchApi } from "../../utils/fetchApiCode";
import { LabelValue } from "../helperComponents/LabelValuePair";

export const PendingBtnComp = styled.button`
  background-color: lightgreen;
  padding: 1rem;
  margin: 0.5rem;
  border: 1px double lightgreen;
  &:hover {
    background-color: ${(props) =>
      props.variant === "accept" ? "#15d200ff" : "#ff4f4fff"};
    cursor: pointer;
  }
  background-color: ${(props) =>
    props.variant === "accept" ? "lightgreen" : "red"};
`;

export const AdminHome = () => {
  const [displayData, setDisplayData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const role = roleExtractor(window.location.pathname);
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetchApi(
          `http://localhost:8090/${role}/data`,
          "GET",
          {}
        );
        setDisplayData(res.output);
      } catch (err) {
        ErrorToast(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      {isLoading ? (
        <>Fetching data...</>
      ) : (
        <StudentHomeSection>
          <ToastContainer />
          <StudentInfo style={{ width: "100%" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
                padding: "1rem",
              }}
            >
              <h3 style={{ marginBottom: "1rem" }}>
                <strong>User Profile:</strong>
              </h3>
              <StyledNavbar variant="inbody">
                <div>
                  <img
                    src={imgpfp}
                    alt="pfp"
                    style={{
                      height: "100px",
                      width: "100px",
                      objectFit: "contain",
                    }}
                  ></img>
                  <LabelValue>
                    <p style={{ margin: "1rem auto" }}>
                      <strong>{displayData.Name}</strong>
                    </p>
                  </LabelValue>
                </div>
                <div>
                  <LabelValue>
                    <p>
                      <strong>Id:</strong>
                    </p>
                    <p>{displayData.Id}</p>
                  </LabelValue>
                  <LabelValue>
                    <p>
                      <strong>Password:</strong>
                    </p>
                    <p>{displayData.Password}</p>
                  </LabelValue>
                </div>
              </StyledNavbar>
            </div>
          </StudentInfo>
        </StudentHomeSection>
      )}
    </div>
  );
};
