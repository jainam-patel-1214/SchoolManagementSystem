import styled from "styled-components"
import { jsPDF } from "jspdf";


export const TeacherInputTabContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
`
export const StudentResultContainer = styled.div`
    border: 1px solid #a9a9a9ff;
    margin: 10px;
    padding: 1rem;
    display: flex;
    justify-content: center;
    flex-direction: column;
`
export const InputContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 2rem;
    width: inherit;
    width: 100%;
    svg{
        margin: 10px;
    }
`
export const ButtonContainer = styled.div`
    margin-right: 10px;
`

export const CommentsContainer = styled.div`
    display: flex;
    flex-direction: column;
    margin: 10px auto;
    width: 70%;
`
export const CommentTeacher = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: left;
    width: 27%;
    border: 1px solid #a9a9a9ff;
    border-radius: 10px;
    box-shadow: 2px 2px 2px 2px #0000002a;
    padding: 5px;
    h3{
        margin: 0;
        font-weight: bold;
    }
    p{
        margin: 0;
        font-weight: 300;
    }
`
export const CommentContent = styled.div`
    display: flex;
    width: 65%;
    flex-direction: row;
    align-items: center;
    border: 1px solid #a9a9a9ff;
    border-radius: 10px;
    box-shadow: 2px 2px 2px 2px #0000002a;
    padding: 5px 10px;
    background-color: #a7caff98;

    svg{
        margin-right: 10px;
    }
`

export const DownloadHandler = async (e, studentName, content) => {
    e.preventDefault()
    const doc = new jsPDF()
    await doc.html(content).then(() => {
        doc.save(`${studentName}_result.pdf`)
    })
}
