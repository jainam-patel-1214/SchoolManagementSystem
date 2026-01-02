import styled from "styled-components";
import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { ErrorToast } from "../../utils/toasterCode";
import { roleExtractor } from "../../utils/roleExtractor";
import { fetchApi } from "../../utils/fetchApiCode";
import { LabelValuePair } from "../helperComponents/LabelValuePair";
import {
  AllComponentsContainer,
  ContentContainers,
  HeadingComponent,
  InfoBox,
  InfoBoxContainer,
  PageHeading,
  UnderlineComponent,
} from "../../styled-components/HelperStyledComponents";

export const PendingBtnComp = styled.button`
  background-color: lightgreen;
  padding: 1rem;
  margin: 0.5rem;
  border: 1px double lightgreen;
  &:hover {
    background-color: ${(props) =>
      props.variant === "accept" ? "#15d2008f" : "#ff18187a"};
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
        const res = await fetchApi(`/${role}/data`, "GET", {});
        if (typeof res.output !== "string") {
          setDisplayData(res.output);
        }
      } catch (err) {
        ErrorToast(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AllComponentsContainer>
      {isLoading ? (
        <>Fetching the data</>
      ) : (
        <div>
          <ToastContainer />
          <ContentContainers
            elements={"multiple"}
            style={{ marginTop: "1rem" }}
          >
            <HeadingComponent position={"top"}>
              <PageHeading>
                Your Profile
                <UnderlineComponent />
              </PageHeading>
            </HeadingComponent>
            <InfoBoxContainer>
              <InfoBox>
                <LabelValuePair
                  label={"Your ID:"}
                  value={displayData.Id}
                ></LabelValuePair>
              </InfoBox>
              <InfoBox>
                <LabelValuePair
                  label={"Name:"}
                  value={displayData.Name}
                ></LabelValuePair>
              </InfoBox>
              <InfoBox>
                <LabelValuePair
                  label={"Password:"}
                  value={displayData.Password}
                ></LabelValuePair>
              </InfoBox>
            </InfoBoxContainer>
          </ContentContainers>
        </div>
      )}
    </AllComponentsContainer>
  );
};
