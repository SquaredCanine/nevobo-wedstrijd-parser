import Link from "next/link"
import { usePathname } from 'next/navigation'
import styled from "styled-components"
import css from "styled-jsx/css"

const Bar = styled.div`
    width: 99vw;
    display: flex;
    background-color: #2f3241;
    justify-content: space-evenly;
    color: #74b1be;
    margin: 2vh 0vw;
`

const Entry = styled.div<{ currentPath?: boolean }>`
    background-color: ${props => props.currentPath ? "white" : "#2f3241"};

    a {
        color: #74b1be;
        text-decoration: none;
    }

    a:visited {
        color: #74b1be;
    }
`

export default function NavBar() {
    return (
        <Bar>
            <Entry currentPath={usePathname() === '/home/'}>
                <Link href="/home">
                    VERSCHIL
                </Link>
            </Entry>
            <Entry currentPath={usePathname() === '/next/'}>
                <Link href="/next">
                    PLANNER
                </Link>
            </Entry>
        </Bar>
    )
}