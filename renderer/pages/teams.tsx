import Head from "next/head"
import React from "react"
import NavBar from "../components/NavBar"
import { Official, Team } from "../../common/interfaces";
import { REQUEST_OFFICIALS, REQUEST_OFFICIALS_OPEN, REQUEST_OFFICIALS_SAVE, REQUEST_OFFICIALS_UPDATE, RESPONSE_OFFICIALS, RESPONSE_OFFICIALS_SAVE } from "../../common/events";
import styled from "styled-components";
import { licentieNiveauToString } from "../util/util";
import { Button } from "../components/button";

const WelkomWrapper = styled.div`
    display: flex;
    flex-direction: column;
    width: 100vw;
    height: 80vh;
    justify-content: center;
    align-items: center;
`

const TeamWrapper = styled.div`
    width: 100vw;
`

const TeamHeader = styled.div`
    width: 100vw;
    background-color: #00469d;
    color: white;
    display: flex;
    justify-content: center;
`

const OfficialWrapper = styled.div`
    width: 100vw;
    padding: 0.5vh 0px;
    background-color: #89CFF0;
    display: flex;
    justify-content: space-evenly;
`

const OfficialAttribute = styled.div`
    width: 25vw;
`


export default function TeamsPage() {

    const [teams, setTeams] = React.useState<Team[]>([]);
    const [teamNames, setTeamNames] = React.useState<string[]>([]);
    const [nieuwTeam, setNieuwTeam] = React.useState<string>("");
    const [nieuweScheidsrechter, setNieuweScheidsrechter] = React.useState<{ naam?: string, team?: string, niveau?: number }>(undefined)

    React.useEffect(() => {
        window.ipc.on(RESPONSE_OFFICIALS, (teams: Team[]) => {
            setTeams(teams.sort((a, b) => a.naam.localeCompare(b.naam)))
            setTeamNames(teams.map((team) => team.naam))
        })
        window.ipc.on(RESPONSE_OFFICIALS_SAVE, (success: boolean) => {
            alert("Officials saved successfully!")
        })
        window.ipc.send(REQUEST_OFFICIALS, undefined)
    }, [nieuweScheidsrechter])

    const slaNieuwTeamOp = () => {
        teams.push({
            naam: nieuwTeam,
            officials: []
        })
        setTeams(teams)
        window.ipc.send(REQUEST_OFFICIALS_UPDATE, teams)
        setNieuwTeam(undefined);
    }

    const voegOfficialToe = () => {
        teams
            .find((_team) => _team.naam === nieuweScheidsrechter.team)
            .officials
            .push({
                naam: nieuweScheidsrechter.naam,
                licentieNiveau: nieuweScheidsrechter.niveau
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

    const renderAddMember = () => {

        const voegLicentieToe = (niveau) => {
            if (!Number.isNaN(+niveau)) {
                if (nieuweScheidsrechter) {
                    setNieuweScheidsrechter({
                        ...nieuweScheidsrechter,
                        niveau
                    })
                } else {
                    setNieuweScheidsrechter({ niveau: +niveau })
                }
            }
        }

        const voegNaamToe = (naam) => {
            if (nieuweScheidsrechter) {
                setNieuweScheidsrechter({
                    ...nieuweScheidsrechter,
                    naam
                })
            } else {
                setNieuweScheidsrechter({ naam })
            }
        }

        const voegTeamToe = (team) => {
            if (nieuweScheidsrechter) {
                setNieuweScheidsrechter({
                    ...nieuweScheidsrechter,
                    team
                })
            } else {
                setNieuweScheidsrechter({ team })
            }
        }

        const naam = (nieuweScheidsrechter && nieuweScheidsrechter.naam) || "Naam?"
        const officialNiveau = (nieuweScheidsrechter && nieuweScheidsrechter.niveau) || "Niveau?"
        const team = (nieuweScheidsrechter && nieuweScheidsrechter.team) || "Team?"

        return (
            <>
                <input
                    type="text"
                    value={naam}
                    onChange={(e) => { voegNaamToe(e.target.value) }} />
                <input
                    type="text"
                    value={officialNiveau}
                    onChange={(e) => { voegLicentieToe(e.target.value) }} />
                <select
                    value={team}
                    onChange={(event) => { voegTeamToe(event.target.value) }}
                >
                    {
                        teamNames.map((teamName) => {
                            return (
                                <option value={teamName}>{teamName}</option>
                            )
                        })
                    }
                </select>
                <button onClick={voegOfficialToe}>Voeg toe</button>
            </>
        )
    }

    const wisselOfficialNaarTeam = (oudTeam: Team, nieuwTeam: string, official: Official) => {
        const teamMap = new Map<string, Team>();
        teams.forEach((team) => teamMap.set(team.naam, team))
        const oudTeamOfficials = oudTeam.officials.filter((_official) => { return _official.naam !== official.naam })
        official.team = nieuwTeam
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
                <OfficialAttribute>
                    {official.relatiecode}
                </OfficialAttribute>
                <OfficialAttribute>
                    {licentieNiveauToString(official.licentieNiveau)}
                </OfficialAttribute>
                <OfficialAttribute>
                    {official.naam}
                </OfficialAttribute>
                <OfficialAttribute>
                    {getTeamDropdown(team, official)}
                </OfficialAttribute>
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
                    team.officials
                        .sort((a, b) => {
                            const licenseCompare =  b.licentieNiveau - a.licentieNiveau
                            if (licenseCompare === 0) {
                                return a.naam.localeCompare(b.naam)
                            } else {
                                return licenseCompare
                            }
                        })
                        .map((official) => { return renderOfficial(team, official) })
                }
            </TeamWrapper>
        )
    }

    const renderSelecteerTeam = () => {
        return (
            <WelkomWrapper>
                Vul hier je teams en scheidsrechters in !
                <Button onClick={() => {
                    window.ipc.send(REQUEST_OFFICIALS_OPEN, undefined); console.log("Triggered");
                }}>
                    Selecteer bestand
                </Button>
            </WelkomWrapper>
        )
    }

    const renderTeamOverzicht = () => {
        return (
            <>
                {
                    teams.map((team) => { return renderTeam(team) })
                }
                {
                    renderAddTeam()
                }
                {
                    renderAddMember()
                }
                <button onClick={(e) => { window.ipc.send(REQUEST_OFFICIALS_SAVE, undefined) }}>Save</button>
            </>
        )
    }

    return (
        <React.Fragment>
            <Head>
                <title>Next - Nextron (basic-lang-typescript)</title>
            </Head>
            <NavBar />
            <div>
                {
                    teams.length <= 0 && renderSelecteerTeam()
                }
                {
                    teams.length > 0 && renderTeamOverzicht()
                }
            </div>
        </React.Fragment>
    )
}