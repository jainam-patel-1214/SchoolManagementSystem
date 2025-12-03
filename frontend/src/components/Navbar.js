import { Fragment, useEffect, useState } from "react"
import { NavbarTabs, StyledNavbar, StyledNavbarSubTabs, StyledNavbarTabs } from "../styled-components/styledNav"
import getCookie from "../utils/getCookie"
import { Outlet } from "react-router-dom"
import delCookie from "../utils/delCookie"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import { FaAngleUp } from "react-icons/fa6";

export const Navbar = (props) => {
    const navigate = useNavigate()
    const [uName, setuName] = useState('')
    const [urole, setRole] = useState('')
    useEffect(() => {
        const name = getCookie("username")
        setuName(name)
        const role = getCookie("role")
        setRole(role)
    }, [])

    const signOutHandler = async (e) => {
        e.preventDefault()
        const msg = await delCookie("userid", "username", "token", "role")
        console.log("msg", msg);
        if (msg.output !== null || msg.output !== undefined) {
            toast(msg.output, {
                position: "top-right",
                autoClose: 2000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
            })
            navigate('/signIn')
        }
    }
    const handleNavigation = (loc) => {
        navigate(loc)
    }

    return (
        <Fragment>
            <ToastContainer />
            <StyledNavbar>
                <div>
                <p style={{ fontSize: "x-large" }}>Welcome <strong>{uName}</strong></p>
                </div>
                <div>
                    {uName !== "" ? <StyledNavbarTabs onClick={(e) => { signOutHandler(e) }} >
                        SignOut
                    </StyledNavbarTabs> : <></>}
                    {urole === "student" ? <StyledNavbarTabs onClick={() => { handleNavigation("schoolResult") }}>
                        School result
                    </StyledNavbarTabs> : <></>}
                    
                    {urole === "teacher"  || urole === "admin" ?
                        <StyledNavbarTabs>
                            Students <FaAngleUp style={{verticalAlign:"middle"}}/>
                            <StyledNavbarSubTabs>
                                <NavbarTabs onClick={() => {handleNavigation("displayStudent") }}>Display Student</NavbarTabs>
                                
                                <NavbarTabs onClick={() => {handleNavigation("addStudent") }}>Add Student</NavbarTabs>
                                
                                <NavbarTabs onClick={()=>{handleNavigation("editStudent")}}>Edit Student</NavbarTabs>
                                
                                <NavbarTabs onClick={()=>{handleNavigation("deleteStudent")}}>Delete Student</NavbarTabs>
                            </StyledNavbarSubTabs>
                        </StyledNavbarTabs> : <></>
                    }
                    {urole === "admin" ?
                        <StyledNavbarTabs>
                            Teachers <FaAngleUp style={{verticalAlign:"middle"}}/>
                            <StyledNavbarSubTabs>
                                <NavbarTabs onClick={() => {handleNavigation("addTeacher") }}>Add Teacher </NavbarTabs>
                                
                                <NavbarTabs onClick={() => {handleNavigation("editTeacher") }}>Edit Teacher </NavbarTabs>
                                
                                <NavbarTabs onClick={()=>{handleNavigation("delTeacher")}}>Delete Teacher </NavbarTabs>
                                
                                <NavbarTabs onClick={()=>{handleNavigation("teacherPerformance")}}>Performance</NavbarTabs>
                            </StyledNavbarSubTabs>
                        </StyledNavbarTabs> : <></>
                    }
                    {urole === "teacher" || urole === "admin" ?
                        <StyledNavbarTabs>
                            Subjects <FaAngleUp style={{verticalAlign:"middle"}}/>
                            <StyledNavbarSubTabs>
                                <NavbarTabs onClick={() => {handleNavigation("displaySubject") }}>List Subject</NavbarTabs>
                                
                                <NavbarTabs onClick={() => {handleNavigation("addSubject") }}>Add Subject</NavbarTabs>
                                
                                <NavbarTabs onClick={()=>{handleNavigation("editSubject")}}>Edit Subject</NavbarTabs>
                                
                                <NavbarTabs onClick={()=>{handleNavigation("deleteSubject")}}>Delete Subject</NavbarTabs>
                                {urole==="admin"?<>
                                <NavbarTabs onClick={()=>{handleNavigation("setSubjectLimit")}}>Subject Limit</NavbarTabs></>:<></>}
                            </StyledNavbarSubTabs>
                        </StyledNavbarTabs> : <></>
                    }
                    {urole === "teacher" || urole === "admin" ?
                        <StyledNavbarTabs>
                            Exams <FaAngleUp style={{verticalAlign:"middle"}}/>
                            <StyledNavbarSubTabs>
                                <NavbarTabs onClick={() => {handleNavigation("enterMarks") }}>Add Marks</NavbarTabs>
                                
                                <NavbarTabs onClick={()=>{handleNavigation("editMarks")}}>Edit Marks</NavbarTabs>
                            </StyledNavbarSubTabs>
                        </StyledNavbarTabs> : <></>
                    }

                    <StyledNavbarTabs>
                        Profile <FaAngleUp style={{verticalAlign:"middle"}}/>
                        {urole === "student" ? <StyledNavbarSubTabs>
                            <NavbarTabs onClick={() => { handleNavigation("/app/student") }}>Account</NavbarTabs>
                            
                            <NavbarTabs onClick={() => { handleNavigation("searchSubject") }}>Subjects</NavbarTabs>
                        </StyledNavbarSubTabs> : <></>}
                        {urole === "teacher" ? <StyledNavbarSubTabs>
                            <NavbarTabs onClick={() => { handleNavigation(`/app/${props.roleOfPerson}`) }}>Account</NavbarTabs>
                            
                            <NavbarTabs onClick={()=>{handleNavigation("reviews")}}>Add Review</NavbarTabs>
                        </StyledNavbarSubTabs> : <></>}
                        {urole === "admin" ? <StyledNavbarSubTabs>
                            <NavbarTabs onClick={() => { handleNavigation(`/app/${props.roleOfPerson}`) }}>Account</NavbarTabs>
                            
                            <NavbarTabs onClick={() => { handleNavigation(`pendingApplications`) }}>Pending req</NavbarTabs>
                            
                        </StyledNavbarSubTabs> : <></>}
                    </StyledNavbarTabs>
                </div>
            </StyledNavbar>
            <Outlet></Outlet>
        </Fragment>
    )
}
