import styled from "styled-components";

export const DropDownContainer = styled.div`
  z-index: 100;
  height: 150px;
  overflow: scroll;
  background-color: #d2d2d27e;
  backdrop-filter: blur(10px);
  border-radius: 10px;
  padding: 5px;
  width: 85%;
  margin-left: 12%;
`;

export const DropDownElement = styled.div`
  width: 100%;
  margin: auto;
  pointer-events: all;
  &:hover {
    cursor: pointer;
    background-color: #d2d2d2c8;
  }
`;
