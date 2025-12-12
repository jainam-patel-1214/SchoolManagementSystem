import styled from "styled-components";

export const StyledButton = styled.button`
    float:right;
    font-size:large;
    padding: 10px;
    background:linear-gradient(to right,#62cff4,#2c67f2);
    color:white;
    width: 250px;
    cursor: pointer;
    border-radius: 25px;
    border: none;
    transition: .3s ease-in;

    &:hover{
        box-shadow: 10px 10px 20px #9d9d9d82;
    }
`

export const StyledInput = styled.input`
    padding: 5px;
    margin: 10px;

`
export const DownloadBtn = styled.button`
    padding: 10px 30px;
    cursor: pointer;
    vertical-align: middle;
    border: none;
    border-radius: 15px;
    margin-right: 15px;
    background-color: #2ad2008a;
    box-shadow: 10px 10px 20px #9d9d9d82;
    height: fit-content;
    transition: .3s ease-in-out;
    &:hover{
        background-color: #30f0008a;
    }
`