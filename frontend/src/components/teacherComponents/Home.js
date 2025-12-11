import { useState, useEffect } from "react"
import { PerformanceWindow, StudentHomeSection } from "../studentComponents/Home"
import { ToastContainer, toast } from "react-toastify"
import { ProfileComponent, ProfileTabs, TableHeader } from "../../styled-components/TableComponents"
import { ErrorToast } from "../../utils/Toaster"
import { FetchApi } from "../../utils/FetchApi"
import { LabelValuePair } from "../helperComponents/LabelValuePair"
import { ReactTableComponent } from "../helperComponents/ResultTable"
import { roleExtractor } from "../../utils/RoleExtractor"
export const TeacherHome = () => {
    const [displayData, setDisplayData] = useState({})
    const [displayReport, setDisplayReport] = useState({})
    const userrole = roleExtractor(window.location.pathname)
    useEffect(() => {
        const baseApi = `http://localhost:8090/${userrole}`

        const load = async () => {
            try {
                const [dataRes, reportRes] = await Promise.all([
                    FetchApi(`${baseApi}/data`, 'GET', {}),
                    FetchApi(`${baseApi}/displayPerformance`, 'GET', {})
                ])
                setDisplayData(dataRes.output)
                setDisplayReport(reportRes.output)
            } catch (err) {
                ErrorToast(err, toast)
            }
        }

        load()
    }, [])
    const columnDef = [
        {
            header: 'Teacher Id',
            accessorKey: 'Tid',
        },
        {
            header: 'Teacher Name',
            accessorKey: 'TName',
        },
        {
            header: 'Standard Allocated',
            accessorKey: 'StdAllocated',
        },
        {
            header: 'Subject Allocated',
            accessorKey: 'SubName',
        },
        {
            header: 'Total Practical Marks',
            accessorKey: 'TotalPracticalMarks',
        },
        {
            header: 'Total Theory Marks',
            accessorKey: 'TotalTheoryMarks',
        },
    ]

    return (
        <div>
            <StudentHomeSection>
                < ToastContainer />
                <ProfileComponent>
                    <ProfileTabs>
                        <LabelValuePair label={"Id:"} value={displayData.Id}></LabelValuePair>
                        <LabelValuePair label={"Name:"} value={displayData.Name}></LabelValuePair>
                        <LabelValuePair label={"Password:"} value={displayData.Password}></LabelValuePair>
                    </ProfileTabs>
                    <ProfileTabs>
                        <LabelValuePair label={"Subject allocated Id:"} value={displayData.SubId}></LabelValuePair>
                        <LabelValuePair label={"Class Allocated:"} value={displayData.Std + displayData.Section}></LabelValuePair>
                        <LabelValuePair label={"Total Students:"} value={"data coming soon"}></LabelValuePair>
                    </ProfileTabs>
                </ProfileComponent>
            </StudentHomeSection>
                <PerformanceWindow>
                    {displayReport?.length && typeof (displayReport) !== 'string' && displayReport !== null && displayReport !== undefined > 0 ?
                        <ReactTableComponent data={displayReport} heading={"Performance among peers"} columnDefinition={columnDef}></ReactTableComponent>
                        : <>No performance report</>}
                </PerformanceWindow>
        </div>
    )
}
