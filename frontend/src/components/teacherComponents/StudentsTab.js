import styled from "styled-components";
import { jsPDF } from "jspdf";

export const InputContainer = styled.div`
  display: flex;
  align-items: center;
  width: inherit;
  width: 100%;
  svg {
    margin: 10px;
  }
`;

export const CommentsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 10px auto;
  width: 70%;
`;
export const CommentTeacher = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: left;
  width: 27%;
  border: 1px solid #a9a9a9ff;
  border-radius: 10px;
  box-shadow: 2px 2px 2px 2px #0000002a;
  padding: 5px;
  h3 {
    margin: 0;
    font-weight: 500;
  }
  p {
    margin: 0;
    font-weight: 300;
  }
`;
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

  svg {
    margin-right: 10px;
  }
`;

export const DownloadHandler = async (e, studentName, content) => {
  e.preventDefault();
  const doc = new jsPDF();
  await doc.html(content).then(() => {
    doc.save(`${studentName}_result.pdf`);
  });
};
