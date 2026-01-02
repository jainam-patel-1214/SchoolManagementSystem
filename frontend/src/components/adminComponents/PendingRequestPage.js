import { useEffect, useState } from "react";
import { roleExtractor } from "../../utils/roleExtractor";
import { fetchApi } from "../../utils/fetchApiCode";
import { ErrorToast, SuccessToast, Toaster } from "../../utils/toasterCode";
import { createColumnHelper } from "@tanstack/react-table";
import { PopoupComponent } from "./AcceptPopup";
import { adminRequestFieldValidator } from "../../utils/acceptRequestValidator";
import styled from "styled-components";
import { PendingBtnComp } from "./Home";
import {
  AllComponentsContainer,
  ContentContainers,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../styled-components/HelperStyledComponents";
import { ToastContainer } from "react-toastify";
import { GeneralTableComponent } from "../helperComponents/GeneralTable";

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: blur(6px);
  background: rgba(255, 255, 255, 0.28);
  display: none;
  z-index: 9;
  display: ${(props) => (props.styleDisplay ? "block" : "none")};
`;

export const AdminPendingReqTab = () => {
  const initState = {
    id: "",
    name: "",
    password: "",
    role: "",
    pendingId: null,
    subjectId: "",
    std: "",
    section: "",
  };
  const [data, setData] = useState(initState);
  const [isStudent, setIsStudent] = useState(false);
  const [isTeacher, setIsTeacher] = useState(false);
  const [displayData, setDisplayData] = useState([]);
  const [styleDisplay, setStyleDisplay] = useState(false);
  const userrole = roleExtractor(window.location.pathname);
  const dataChangeHandler = (key, value) => {
    setData((prevdata) => ({
      ...prevdata,
      [key]: value,
    }));
  };
  const emptyDataHandler = () => {
    setIsStudent(false);
    setIsTeacher(false);
    setData(initState);
  };

  const fetchPendingApps = async () => {
    try {
      const res = await fetchApi(`/${userrole}/pendingRequest`, "GET", {});
      if (typeof res.output !== "string") {
        setDisplayData(res.output);
      }
    } catch (err) {
      ErrorToast(err);
    }
  };
  const handleAccept = async (e, v) => {
    e.preventDefault();
    let userName = v.userName;
    let userPwd = v.pwd;
    let userRole = v.roleReq;
    let pend = v.pendingId;
    if (userRole === "student") setIsStudent(true);
    if (userRole === "teacher") setIsTeacher(true);
    dataChangeHandler("pendingId", Number(pend));
    dataChangeHandler("name", userName);
    dataChangeHandler("password", userPwd);
    dataChangeHandler("role", userRole);
    setStyleDisplay(true);
    document.querySelector("body").style.overflow = "hidden";
  };
  const handleReject = async (e, v) => {
    e.preventDefault();
    try {
      const payload = {
        pendingId: Number(v.pendingId),
        uName: v.userName,
        uPwd: v.pwd,
        uRole: v.roleReq,
      };
      const res = await fetchApi(
        `/${userrole}/rejectRequest`,
        "DELETE",
        payload
      );
      if (res.output) {
        SuccessToast("Rejected !!");
        emptyDataHandler();
        fetchPendingApps();
      }
    } catch (error) {
      ErrorToast(error);
    }
  };
  const handleHide = (e) => {
    e.preventDefault();
    emptyDataHandler();
    setStyleDisplay(false);
    document.querySelector("body").style.overflow = "auto";
  };

  const handleSubmitForm = async (e) => {
    e.preventDefault();
    let payload = {};
    if (
      Number(data.pendingId) === 0 ||
      data.name === "" ||
      data.password === "" ||
      data.role === ""
    ) {
      ErrorToast("some error occured please try again.");
      return;
    }
    payload = {
      pendingId: Number(data.pendingId),
      uName: data.name,
      uPwd: data.password,
      uRole: data.role,
      Uid: Number(data.id),
    };
    if (isStudent) {
      payload = { ...payload, std: Number(data.std), section: data.section };
      const isValid = adminRequestFieldValidator(payload);
      console.log("is valid", isValid);

      if (!isValid) {
        return;
      }
    } else if (isTeacher) {
      payload = {
        ...payload,
        std: Number(data.std),
        section: data.section,
        subId: Number(data.subjectId),
      };
      const isValid = adminRequestFieldValidator(payload);
      if (!isValid) {
        return;
      }
    } else if (!isStudent && !isTeacher) {
      const isValid = adminRequestFieldValidator(payload);
      if (!isValid) {
        return;
      }
    }

    try {
      const res = await fetchApi(`/${userrole}/acceptRequest`, "POST", payload);
      Toaster(res);
    } catch (error) {
      ErrorToast(error);
    } finally {
      handleHide(e);
      setStyleDisplay(false);
      emptyDataHandler();
      fetchPendingApps();
      e.target.reset();
    }
  };

  useEffect(() => {
    fetchPendingApps();
  }, []);

  const columnHelper = createColumnHelper();
  const columns = [
    columnHelper.accessor("roleReq", {
      header: "Role requested",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),

    columnHelper.accessor("userName", {
      header: "Name",
      cell: (info) => info.getValue(),
      enableSorting: true,
    }),

    columnHelper.accessor("pwd", {
      header: "Password",
      cell: (info) => info.getValue(),
      enableSorting: false,
    }),

    columnHelper.display({
      id: "accept",
      header: "Accept",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <PendingBtnComp
            type="button"
            variant={"accept"}
            onClick={(e) => handleAccept(e, v)}
          >
            Accept
          </PendingBtnComp>
        );
      },
    }),

    columnHelper.display({
      id: "reject",
      header: "Reject",
      cell: ({ row }) => {
        const v = row.original;
        return (
          <PendingBtnComp
            type="button"
            variant={"reject"}
            onClick={(e) => handleReject(e, v)}
          >
            Reject
          </PendingBtnComp>
        );
      },
    }),
  ];

  return (
    <AllComponentsContainer>
      <ToastContainer />
      <HeadingComponent position={"top"}>
        <PageHeading>
          Pending requests tab
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">List of all the users who wish to register</p>
      </HeadingComponent>
      <Overlay styleDisplay={styleDisplay}></Overlay>
      <div style={{ padding: "1rem" }}>
        <PopoupComponent
          styleDisplay={styleDisplay}
          close={handleHide}
          isTeacher={isTeacher}
          isStudent={isStudent}
          submitHandler={handleSubmitForm}
          data={data}
          newHandler={dataChangeHandler}
        ></PopoupComponent>
        {displayData.length > 0 ? (
          <ContentContainers
            elements={"single"}
            usage={"nongrid"}
            style={{ padding: "15px" }}
          >
            <GeneralTableComponent
              data={displayData}
              columnDefinition={columns}
            />
          </ContentContainers>
        ) : (
          <>There are no pending applications</>
        )}
      </div>
    </AllComponentsContainer>
  );
};
