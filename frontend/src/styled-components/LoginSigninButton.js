import styled from "styled-components";

export const SignInBtn = styled.button`
    position: relative;
    margin: 2rem;
    padding: 10px;
    border: none;
    border-radius: 15px;
    background: linear-gradient(to right,
            rgba(0, 255, 255, 0.7),
            rgba(0, 153, 255, 0.7),
            rgba(148, 0, 148, 0.7),
            rgba(255, 78, 217, 0.7));
    color: white;
    transition: 0.3s ease-out;
    cursor: pointer;
    &::after {
        content: "";
        position: absolute;
        inset: 0;
        background-color: #0000006e;
        border: none;
        border-radius: 15px;
        cursor: not-allowed;
    }
    &:hover::after {
        content: "Invalid/Empty Fields";
        color: red;
        position: absolute;
        background-color: transparent;
        top: -20px;
    }
    &:hover{
        background: linear-gradient(to right,
            rgba(61, 255, 255, 0.7),
            rgba(65, 179, 255, 0.7),
            rgba(255, 75, 255, 0.7),
            rgba(255, 131, 228, 0.7));
    }
`