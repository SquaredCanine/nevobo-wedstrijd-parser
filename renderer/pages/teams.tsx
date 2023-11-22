import Head from "next/head"
import React from "react"
import NavBar from "../components/NavBar"
import { Official, Team } from "../../common/interfaces";
import { REQUEST_OFFICIALS, REQUEST_OFFICIALS_OPEN, RESPONSE_OFFICIALS, RESPONSE_OFFICIALS_SAVE } from "../../common/events";
import styled from "styled-components";

const TeamWrapper = styled.div`
    width: 10vw;
    background-color: black;
`

const TeamHeader = styled.div`
    width: 15vw;
    background-color: blue;
`

const OfficialWrapper = styled.div`
    width: 15vw;
    background-color: green;
`


export default function TeamsPage() {

    const [teams, setTeams] = React.useState<Team[]>([]);

    React.useEffect(() => {
        window.ipc.on(RESPONSE_OFFICIALS, (teams: Team[]) => {
            setTeams(teams)
        })
        window.ipc.on(RESPONSE_OFFICIALS_SAVE, (success: boolean) => {
            alert("Officials saved successfully!")
        })
        window.ipc.send(REQUEST_OFFICIALS, undefined)
    }, [])

    const renderAddTeam = () => {

    }

    const renderOfficial = (official: Official) => {
        return (
            <OfficialWrapper>
                <>
                    {official.naam} - {official.team} - {official.licentieNiveau && official.licentieNiveau}
                </>
            </OfficialWrapper>

        )
    }

    const renderTeam = (team: Team) => {
        return (
            <TeamWrapper>
                <TeamHeader>
                    {team.naam}
                </TeamHeader>
                {
                    team.officials.map((official) => { return renderOfficial(official) })
                }
            </TeamWrapper>
        )
    }

    return (
        <React.Fragment>
            <Head>
                <title>Next - Nextron (basic-lang-typescript)</title>
            </Head>
            <NavBar />
            <div>
                <button
                    onClick={() => {
                        window.ipc.send(REQUEST_OFFICIALS_OPEN, undefined)
                    }}
                >
                    Selecteer scheidsrechters bestand
                </button>
                Vul hier je teams en scheidsrechters in!
                {
                    teams.map((team) => { return renderTeam(team) })
                }
            </div>
        </React.Fragment>
    )
}