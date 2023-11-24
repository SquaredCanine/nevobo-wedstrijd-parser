import styled from "styled-components";

export const Button = styled.div`
    border: 1px solid #00162b;
    width: fit-content;
    padding: 10px 5px;
    border-radius: 6px;
    background-color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;

    &:hover {
        background-color: #00162b;
        color: white;
    }
`