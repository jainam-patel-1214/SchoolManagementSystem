import { useState, useEffect } from "react"
import { Label, LabelValue, PerformanceWindow, StudentHomeSection, StudentInfo, SubInfo, TableEntry, Value } from "../studentComponents/Home"
import { ToastContainer, toast } from "react-toastify"
import { ProfileComponent, ProfileTabs, TableHeader } from "../../styled-components/TableComponents"
import { SearchOutputSection } from "../studentComponents/SchoolRes"
export const TeacherHome = (props) => {
    const [displayData, setDisplayData] = useState({})
    const [displayReport, setDisplayReport] = useState({})

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const resp = await fetch(`http://localhost:8090/${props.roleOfPerson}/displayPerformance`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const res = await resp.json();
                console.log("performance", res.output);
                setDisplayReport(res.output);
            } catch (err) {
                console.log(err);
                toast.error(err.error || "Something went wrong", {
                })
            }
        };
        const fetchData = async () => {
            try {
                const resp = await fetch(`http://localhost:8090/${props.roleOfPerson}/data`, {
                    method: 'GET',
                    credentials: 'include',
                });
                const res = await resp.json();
                console.log("data", res.output);
                setDisplayData(res.output);
            } catch (err) {
                console.log(err);
                toast.error(err.error || "Something went wrong", {

                })
            }
        };
        fetchData()
        fetchReport()
    }, []);
    // useEffect(() => {

    // }, [])

    return (
        <div>
            <StudentHomeSection>
                < ToastContainer />
                <ProfileComponent>
                    <ProfileTabs>
                        <LabelValue>
                            <Label><strong>Id:</strong></Label>
                            <Value>{displayData.Id}</Value>
                        </LabelValue>
                        <LabelValue>
                            <Label><strong>Name:</strong></Label>
                            <Value>{displayData.Name}</Value>
                        </LabelValue>
                        <LabelValue>
                            <Label><strong>Password:</strong></Label>
                            <Value>{displayData.Password}</Value>
                        </LabelValue>
                        </ProfileTabs>
                    <ProfileTabs>
                        <LabelValue>
                            <Label><strong>Subject allocated Id:</strong></Label>
                            <Value>{displayData.SubId}</Value>
                        </LabelValue>
                        <LabelValue>
                            <Label><strong>Class Allocated:</strong></Label>
                            <Value>{displayData.Std + displayData.Section}</Value>
                        </LabelValue>
                        <LabelValue>
                            <Label><strong>Total Students:</strong></Label>
                            <Value>10</Value>
                        </LabelValue>
                    </ProfileTabs>
                </ProfileComponent>
            </StudentHomeSection>
            <SearchOutputSection>
            <PerformanceWindow>
                <h2>Performance among peers</h2>
                        {displayReport?.length > 0 ? 
                        <div style={{ border: "1px solid #a9a9a9ff", margin: "10px", padding: "1rem", display: "flex", justifyContent: "center", flexDirection: "column", alignItems: "center" }}>
                            <SubInfo style={{ width: "100%" }}>
                                <thead>
                                    <tr>
                                        <TableHeader>Teacher Id</TableHeader>
                                        <TableHeader>Teacher Name</TableHeader>
                                        <TableHeader>Standard Allocated</TableHeader>
                                        <TableHeader>Subject Allocated</TableHeader>
                                        <TableHeader>Total Practical Marks</TableHeader>
                                        <TableHeader>Total Theory Marks</TableHeader>
                                    </tr>
                                </thead>
                                <tbody>
                                    {displayReport?.map((element, index) => {
                                        return (
                                            <tr key={index}>
                                                <TableEntry>{element.Tid}</TableEntry>
                                                <TableEntry>{element.TName}</TableEntry>
                                                <TableEntry>{element.StdAllocated}</TableEntry>
                                                <TableEntry>{element.SubName}</TableEntry>
                                                <TableEntry>{element.TotalPracticalMarks}</TableEntry>
                                                <TableEntry>{element.TotalTheoryMarks}</TableEntry>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </SubInfo> 
                            </div> : <>No performance report</>}
            </PerformanceWindow>
            </SearchOutputSection>
        </div>
    )
}
