import styled, { keyframes } from "styled-components";

const typing = keyframes`
    from {
        text-align: center;
        width: 0;
    }
    to {
        width: 100%;
    }
    `;

export const SignInForm = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: fit-content;
  padding: 3rem;
  background-color: whitesmoke;
  border: none;
  border-radius: 5px;
  h3 {
    cursor: pointer;
    margin: 0;
    margin-top: 10px;
    transition: 0.3s;

    &:hover {
      border-bottom: 1px solid black;
      border-top: none;
      border-left: none;
      border-right: none;
      color: blue;
    }
  }
  p {
    margin: 0;
  }
`;

export const SignUpAndLoginForm = styled.form`
  display: flex;
  flex-direction: column;

  h2 {
    text-align: center;
    animation: ${typing} 2s steps(19) forwards;
    overflow: hidden;
    white-space: nowrap;
  }
  label {
    color: rgb(67, 66, 66);
    margin-top: 1rem;
  }
  input {
    background-color: transparent;
    border-bottom: 1px solid black;
    border-top: none;
    border-left: none;
    border-right: none;
    margin-bottom: 1rem;
    font-size: large;
    &::placeholder {
      color: rgb(144, 144, 144);
      font-size: small;
    }
    &:focus {
      border-bottom: 1px solid black;
      border-top: none;
      border-left: none;
      border-right: none;
      outline: none;
    }
  }
`;

export const SelectInRegister = styled.select`
  border: 1px solid #b9b9b9;
  padding: 5px;
`;
