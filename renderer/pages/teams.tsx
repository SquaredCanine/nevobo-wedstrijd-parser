import Head from "next/head"
import React from "react"
import NavBar from "../components/NavBar"
import { Official, Team } from "../../common/interfaces";
import { REQUEST_OFFICIALS, REQUEST_OFFICIALS_OPEN, REQUEST_OFFICIALS_SAVE, REQUEST_OFFICIALS_UPDATE, RESPONSE_OFFICIALS, RESPONSE_OFFICIALS_SAVE } from "../../common/events";
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
    width: 50vw;
    background-color: green;
`


export default function TeamsPage() {

    const [teams, setTeams] = React.useState<Team[]>([]);
    const [teamNames, setTeamNames] = React.useState<string[]>([]);
    const [nieuwTeam, setNieuwTeam] = React.useState<string>("");

    React.useEffect(() => {
        window.ipc.on(RESPONSE_OFFICIALS, (teams: Team[]) => {
            setTeams(teams.sort((a, b) => a.naam.localeCompare(b.naam)))
            setTeamNames(teams.map((team) => team.naam))
        })
        window.ipc.on(RESPONSE_OFFICIALS_SAVE, (success: boolean) => {
            alert("Officials saved successfully!")
        })
        window.ipc.send(REQUEST_OFFICIALS, undefined)
    }, [])

    const slaNieuwTeamOp = () => {
        teams.push({
            naam: nieuwTeam,
            officials: []
        })
        setTeams(teams)
        window.ipc.send(REQUEST_OFFICIALS_UPDATE, teams)
    }

    const renderAddTeam = () => {
        return (
            <>
                <input
                    type="text"
                    value={nieuwTeam || "Team naam?"}
                    onChange={(e) => setNieuwTeam(e.target.value)} />
                <button onClick={(e) => { slaNieuwTeamOp() }}>Voeg toe</button>
            </>
        )
    }

    const wisselOfficialNaarTeam = (oudTeam: Team, nieuwTeam: string, official: Official) => {
        const teamMap = new Map<string, Team>();
        teams.forEach((team) => teamMap.set(team.naam, team))
        const oudTeamOfficials = oudTeam.officials.filter((_official) => { return _official.naam !== official.naam})
        teamMap.get(nieuwTeam).officials.push(official)
        teamMap.get(oudTeam.naam).officials = oudTeamOfficials
        setTeams(Array.from(teamMap.values()))
        window.ipc.send(REQUEST_OFFICIALS_UPDATE, teams)        
    }

    const getTeamDropdown = (team: Team, official: Official) => {
        return (
            <select
                value={team.naam}
                onChange={(nieuwTeam) => wisselOfficialNaarTeam(team, nieuwTeam.target.value, official)}
            >
                {
                    teamNames.map((teamNaam) => {
                        return (
                            <option value={teamNaam}>{teamNaam}</option>
                        )
                    })
                }
            </select>
        )
    }

    const renderOfficial = (team: Team, official: Official) => {
        return (
            <OfficialWrapper>
                <>
                    {official.naam} - {getTeamDropdown(team, official)} - {official.licentieNiveau && official.licentieNiveau}
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
                    team.officials.map((official) => { return renderOfficial(team, official) })
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
                        window.ipc.send(REQUEST_OFFICIALS_OPEN, undefined); console.log("Triggered");
                    }}
                >
                    Selecteer scheidsrechters bestand
                </button>
                Vul hier je teams en scheidsrechters in!
                {
                    teams.map((team) => { return renderTeam(team) })
                }
                {
                    renderAddTeam()
                }
                <button onClick={(e) => { window.ipc.send(REQUEST_OFFICIALS_SAVE, undefined) }}>Save</button>
            </div>
        </React.Fragment>
    )
}