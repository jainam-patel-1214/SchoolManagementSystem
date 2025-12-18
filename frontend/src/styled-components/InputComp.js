import styled from "styled-components";

export const InputWrapper = styled.div`
  display: block;
  position: relative;
  margin: 20px 0;
  width: 95%;
`;

export const FloatingInput = styled.input`
  width: inherit;
  padding: 12px 10px;
  font-size: 16px;
  border: 1px solid gray;
  border-radius: 10px;
  outline: none;
  background: transparent;
  transition: border-color 0.3s;

  &:focus {
    border-color: #007bff;
  }
  &:not(:placeholder-shown) + label {
    top: -15px;
    font-size: 12px;
    color: #007bff;
  }

  &:focus + label {
    top: -15px;
    font-size: 12px;
    color: #007bff;
  }
`;

export const FloatingLabel = styled.label`
  position: absolute;
  left: 10px;
  top: 13px;
  color: #777;
  font-size: 13px;
  pointer-events: none;
  transition: 0.2s ease all;
`;
