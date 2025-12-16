import { Fragment, useEffect, useRef, useState } from "react";
import { GradeCalculator } from "../../../utils/gradeCalculator";
import { GrNoOrSubIdValidation } from "../../../utils/validations";
import { fetchApi } from "../../../utils/fetchApiCode";
import { toast, ToastContainer } from "react-toastify";
import { ErrorToast, Toaster } from "../../../utils/toasterCode";
import {
  SearchBoxSection,
  SearchForm,
  SearchOutputSection,
  SearchParamSection,
} from "../../studentComponents/SchoolResult";
import {
  ButtonContainer,
  CommentContent,
  CommentsContainer,
  CommentTeacher,
  DownloadHandler,
  InputContainer,
  StudentResultContainer,
  TeacherInputTabContainer,
} from "../StudentsTab";
import { FaCircleUser, FaRegCommentDots } from "react-icons/fa6";
import {
  FloatingInput,
  FloatingLabel,
  InputWrapper,
} from "../../../styled-components/InputComp";
import {
  DownloadBtn,
  StyledButton,
} from "../../../styled-components/StyledButton";
import { LabelValuePair } from "../../helperComponents/LabelValuePair";
import {
  PerformanceWindow,
  StudentInfo,
  StudentInfoSegment,
} from "../../studentComponents/Home";
import { ReactTableComponent } from "../../helperComponents/ResultTable";
import { FaFileDownload } from "react-icons/fa";
import { roleExtractor } from "../../../utils/roleExtractor";
import {
  AllComponentsContainer,
  ButtonElement,
  ContentContainers,
  GridContainer,
  GridItem,
  HeadingComponent,
  PageHeading,
  UnderlineComponent,
} from "../../../styled-components/HelperStyledComponents";
import { LineBreak } from "../../../styled-components/LineBreak";
import { GridItemComponent } from "../../helperComponents/GridItem";

export const StudentDataComponent = () => {
  const performanceComponent = useRef(null);
  const [filterQuery, seyFilterQuery] = useState("");
  const [grNo, setGrNo] = useState(0);
  const [displayData, setDisplayData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [totalMsg, setTotalMsg] = useState("");
  const userrole = roleExtractor(window.location.pathname);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetchApi(
        `http://localhost:8090/teacher/allStudents`,
        "GET",
        {}
      );
      if (res.output) {
        setDisplayData(res.output);
        return;
      }
    } catch (err) {
      ErrorToast(err, toast);
    } finally {
      setIsLoading(false);
    }
  };
  const deleteStudentHandler = async (apiUrl, grNo) => {
    try {
      if (!GrNoOrSubIdValidation(grNo)) {
        ErrorToast("invalid gr no");
        return;
      }
      let res;
      res = await fetchApi(apiUrl, "DELETE", { grNo: grNo });
      Toaster(res, toast);
      if (res.output) {
        fetchData();
      }
    } catch (err) {
      ErrorToast(err, toast);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);

  // useEffect(() => {
  //   let sum = 0;
  //   displayData?.MarkInfo?.forEach((e) => {
  //     console.log(Number(e.practicalMM) + Number(e.theoryMM));
  //     sum += Number(e.practicalMM) + Number(e.theoryMM);
  //   });
  //   const res = GradeCalculator(
  //     (sum * 100) / (100 * displayData?.MarkInfo?.length)
  //   );
  //   setTotalMsg(res);
  // }, [displayData]);

  // const sumbitHandler = async (e, apiUrl) => {
  //   e.preventDefault();
  //   if (!GrNoOrSubIdValidation(grNo)) {
  //     ErrorToast("invalid gr no");
  //     return;
  //   }
  //   try {
  //     let res;
  //     res = await fetchApi(
  //       apiUrl + "?" + new URLSearchParams({ studId: grNo }),
  //       "GET",
  //       {}
  //     );
  //     Toaster(res, toast);
  //     if (res.output) {
  //       setDisplayData(res.output);
  //       return;
  //     }
  //   } catch (err) {
  //     ErrorToast(err, toast);
  //   } finally {
  //     setGrNo(null);
  //     e.target.reset();
  //   }
  // };
  // const columnDef = [
  //   {
  //     header: "Subject Id",
  //     accessorKey: "subId",
  //   },
  //   {
  //     header: "Subject Name",
  //     accessorKey: "subjectName",
  //   },
  //   {
  //     header: "Practical Marks",
  //     accessorKey: "practicalMM",
  //   },
  //   {
  //     header: "Theory Marks",
  //     accessorKey: "theoryMM",
  //   },
  //   {
  //     header: "Grade",
  //     accessorKey: "grade",
  //   },
  // ];

  return (
    <AllComponentsContainer>
      <HeadingComponent position={"top"}>
        <PageHeading>
          Display students
          <UnderlineComponent />
        </PageHeading>
      </HeadingComponent>
      <HeadingComponent position={"bottom"}>
        <p className="subHeading">List of all the students within the school</p>
      </HeadingComponent>

      <ContentContainers elements={"single"} usage={"nongrid"}>
        <InputContainer>
          <FaCircleUser style={{ fontSize: "xx-large" }} />
          <InputWrapper>
            <FloatingInput
              type="text"
              value={grNo || ""}
              name="grNo"
              required
              placeholder=" "
              onChange={(e) => setGrNo(Number(e.target.value))}
            />
            <FloatingLabel>Filter students by Gr NO or name:</FloatingLabel>
          </InputWrapper>
        </InputContainer>
        <ButtonElement
          bgcol={"default"}
          border={"default"}
          textcol={"default"}
          hovercol={"default"}
        >
          Search
        </ButtonElement>
      </ContentContainers>

      <LineBreak />

      <ContentContainers elements={"single"} usage={"nongrid"}>
        {isLoading ? (
          <div>Fetching all students</div>
        ) : (
          <GridContainer>
            {displayData?.map((value, i) => (
              <GridItemComponent
                key={i}
                index={i}
                grNo={value.grNo}
                password={value.password}
                name={value.studentName}
                grade={value.grade}
                section={value.section}
                delete={deleteStudentHandler}
              ></GridItemComponent>
            ))}
          </GridContainer>
        )}
      </ContentContainers>
    </AllComponentsContainer>
    //  <SearchBoxSection>
    //   <ToastContainer />
    //   <SearchParamSection>
    //     <SearchForm
    //       onSubmit={(e) =>
    //         sumbitHandler(e, `http://localhost:8090/${userrole}/displayStud`)
    //       }
    //     >
    //       <TeacherInputTabContainer>
    //         <InputContainer>
    //           <FaCircleUser style={{ fontSize: "xx-large" }} />
    //           <InputWrapper>
    //             <FloatingInput
    //               type="number"
    //               value={grNo || ""}
    //               name="grNo"
    //               required
    //               placeholder=" "
    //               onChange={(e) => setGrNo(Number(e.target.value))}
    //             />
    //             <FloatingLabel>Provide Gr NO for student:</FloatingLabel>
    //           </InputWrapper>
    //         </InputContainer>
    //       </TeacherInputTabContainer>
    //       <ButtonContainer>
    //         <StyledButton type="submit">Submit</StyledButton>
    //       </ButtonContainer>
    //     </SearchForm>
    //   </SearchParamSection>
    // </SearchBoxSection>
    // {displayData !== undefined && displayData !== null ? (
    //   <SearchOutputSection>
    //     {displayData === undefined || displayData === null ? (
    //       <></>
    //     ) : (
    //       <>
    //         {typeof displayData === "string" ? (
    //           <span style={{ padding: "10px" }}>{displayData}</span>
    //         ) : (
    //           <Fragment>
    //             <StudentInfo>
    //               <StudentInfoSegment>
    //                 <LabelValuePair
    //                   label={"Name:"}
    //                   value={displayData.StudData.Name}
    //                 ></LabelValuePair>
    //                 <LabelValuePair
    //                   label={"Standard:"}
    //                   value={displayData.StudData.Std}
    //                 ></LabelValuePair>
    //                 <LabelValuePair
    //                   label={"Password:"}
    //                   value={displayData.StudData.Password}
    //                 ></LabelValuePair>
    //                 <LabelValuePair
    //                   label={"Section:"}
    //                   value={displayData.StudData.Section}
    //                 ></LabelValuePair>
    //               </StudentInfoSegment>
    //             </StudentInfo>
    //             <PerformanceWindow ref={performanceComponent}>
    //               <h2
    //                 style={{
    //                   textDecoration: "underline",
    //                   textDecorationColor: "#69a5ff",
    //                 }}
    //               >
    //                 Student Report Card
    //               </h2>
    //               <div style={{ border: "1px solid #69a5ff", width: "100%" }}>
    //                 <div
    //                   style={{
    //                     border: "1px solid grey",
    //                     margin: "10px",
    //                     padding: "1rem",
    //                     display: "flex",
    //                     justifyContent: "center",
    //                     flexDirection: "column",
    //                     alignItems: "center",
    //                   }}
    //                 >
    //                   <h3>Teachers' comment</h3>
    //                   {displayData.CommentInfo?.length > 0 ? (
    //                     <>
    //                       <CommentsContainer>
    //                         {displayData.CommentInfo.map((element, index) => {
    //                           return (
    //                             <div
    //                               key={index}
    //                               style={{
    //                                 display: "flex",
    //                                 flexDirection: "row",
    //                                 justifyContent: "space-between",
    //                                 margin: "3px 0",
    //                               }}
    //                             >
    //                               <CommentTeacher>
    //                                 <h3>{element.tName}</h3>
    //                                 <p>ID:{element.tId}</p>
    //                               </CommentTeacher>
    //                               <CommentContent>
    //                                 <FaRegCommentDots />
    //                                 <p>Review:&nbsp;{element.comment}</p>
    //                               </CommentContent>
    //                             </div>
    //                           );
    //                         })}
    //                       </CommentsContainer>
    //                     </>
    //                   ) : (
    //                     <>No review made by any teacher</>
    //                   )}
    //                 </div>
    //                 <StudentResultContainer>
    //                   {typeof displayData.MarkInfo !== "string" &&
    //                   displayData.MarkInfo !== null &&
    //                   displayData.MarkInfo !== undefined &&
    //                   displayData.MarkInfo.length > 0 ? (
    //                     <ReactTableComponent
    //                       data={displayData.MarkInfo}
    //                       heading={"Academic Performance"}
    //                       columnDefinition={columnDef}
    //                     ></ReactTableComponent>
    //                   ) : (
    //                     <>No entry of marks provided by any teacher</>
    //                   )}
    //                 </StudentResultContainer>
    //               </div>
    //             </PerformanceWindow>
    //             <div
    //               style={{
    //                 border: "1px solid #a9a9a9ff",
    //                 display: "flex",
    //                 flexDirection: "row",
    //                 justifyContent: "space-between",
    //                 margin: "1rem auto",
    //                 alignItems: "center",
    //                 width: "97%",
    //               }}
    //             >
    //               <p style={{ textAlign: "left", marginLeft: "3px" }}>
    //                 <strong>
    //                   <i>Result:&nbsp;</i>
    //                 </strong>
    //                 {totalMsg}
    //               </p>
    //               <DownloadBtn
    //                 onClick={(e) => {
    //                   DownloadHandler(
    //                     e,
    //                     displayData.StudData.Name,
    //                     performanceComponent.current.innerHTML
    //                   );
    //                 }}
    //               >
    //                 <FaFileDownload /> &nbsp;Download
    //               </DownloadBtn>
    //             </div>
    //           </Fragment>
    //         )}
    //       </>
    //     )}
    //   </SearchOutputSection>
    // ) : (
    //   <></>
    // )}
  );
};
