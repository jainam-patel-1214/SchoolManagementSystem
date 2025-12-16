import styled from "styled-components";
export const StyledNavbar = styled.div`
  padding: 5px 20px;
  background: white;
  height: 10vh;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin: auto;
  position: sticky;
  top: 0;

  z-index: ${(props) => (props.variant === "inbody" ? 1 : 20)};
`;
export const StyledNavbarSubTabs = styled.div`
  display: none;
  background: #e9f8ffff;
  backdrop-filter: blur(150px);
  width: max-content;
  margin-top: 1rem;
  position: absolute;
  left: 0;
  top: 50%;
`;
export const NavbarTabs = styled.button`
  padding: 10px;
  background: none;
  border: none;
  cursor: pointer;
  &:hover {
    background-color: #d0e9ffff;
    backdrop-filter: blur(150px);
  }
`;
export const StyledNavbarTabs = styled.div`
  /* background: #e9f8ffff; */
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
  /* &:hover {
    background: #bbebffff;
  } */

  &:hover ${StyledNavbarSubTabs} {
    display: flex;
    flex-direction: column;
    justify-content: center;
    z-index: 10;
    backdrop-filter: blur(150px);
  }
`;
