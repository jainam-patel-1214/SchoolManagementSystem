import styled from "styled-components";
export const StyledNavbar = styled.div`
    padding: 5px 20px;
    background: #e7e7e782;
    backdrop-filter: blur(10px);
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: ${props => {
    return props.variant === 'inbody'
        ? "-webkit-fill-available"
        : "90%"
}};

    margin: auto;
    margin-bottom: 1rem;
    position: sticky;
    top: 1rem;
    border-radius: 50px;
    
    z-index: ${(props)=>{return props.variant==='inbody'?1:20}};
    `
export const StyledNavbarSubTabs = styled.div`
    display: none;
    background: #a8d6ffff;
    backdrop-filter: blur(150px);
    width: max-content;
    margin-top: 1rem;
    position: absolute;
    left: 0;
    top: 50%;
`
export const NavbarTabs = styled.button`
    padding: 10px;
    background: none;
    border: none;
    cursor: pointer;
    &:hover{
        background-color: #d0e9ffff;
        backdrop-filter: blur(150px);
    }
    /* margin-top: 1rem; */
`
export const StyledNavbarTabs = styled.div`
        background: #e9f8ffff;
        color: #4359ffff;
        vertical-align: middle;
        border-radius: 15px;
        padding: 10px;
        display: inline-block;
        cursor: pointer;
        border: none;
        position: relative;
        margin-right: 10px;
        svg {
        transition: transform 0.3s ease;
        }

        &:hover svg {
            transform: rotateZ(180deg);
        }
        &:hover{
            background: #bbebffff;
        }

        &:hover ${StyledNavbarSubTabs} {
            display: flex;
            flex-direction: column;
            justify-content: center;
            z-index: 10;
            backdrop-filter: blur(150px);
        }
    `