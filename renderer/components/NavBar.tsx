import Link from "next/link"
import { usePathname } from 'next/navigation'
import React from "react"
import styled from "styled-components"

const Bar = styled.div`
    width: 100vw;
    display: flex;
    background-color: #00162b;
    justify-content: space-evenly;
    color: #74b1be;
    padding: 20px 0vh;
`

const Entry = styled.div<{ $currentpath: boolean }>`
    background-color: ${props => props.$currentpath ? "white" : "#00162b"};
    border-radius: 6px;

    &:hover {
        ${props => props.$currentpath ? 
        "" : 
        "background-color: rgba(255, 255, 255, 0.1);"
        };
    }

    a {
        color: ${props => props.$currentpath ? "#00162b" : "white"};
        text-decoration: none;
    }

    a:visited {
        color: ${props => props.$currentpath ? "#00162b" : "white"};
    }
`

const StyledLink = styled(Link)`
    height: 40px;
    padding: 0 16px;
    display: flex;
    justify-content: center;
    align-items: center;
`

export default function NavBar() {
    return (
        <Bar>
            <Entry $currentpath={usePathname() && usePathname() === '/home/'}>
                <StyledLink href="/home">
                    Verschil
                </StyledLink>
            </Entry>    
            <Entry $currentpath={usePathname() && usePathname() === '/schedule/'}>
                <StyledLink href="/schedule">
                    Planner
                </StyledLink>
            </Entry>
            <Entry $currentpath={usePathname() && usePathname() === '/teams/'}>
                <StyledLink href="/teams">
                    Organizatie
                </StyledLink>
            </Entry>
        </Bar>
    )
}

