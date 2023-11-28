import React from 'react'
import Head from 'next/head'
import NavBar from '../components/NavBar'
import { REQUEST_SCHEDULE, REQUEST_OFFICIALS, REQUEST_OPEN_SCHEDULE, REQUEST_SAVE_SCHEDULE, REQUEST_UPDATE_SCHEDULE, RESPONSE_OFFICIALS, RESPONSE_SCHEDULE, RESPONSE_SCHEDULE_SAVE, REQUEST_EXPORT_SCHEDULE } from '../../common/events'
import { Official, PlannedMatch, Team } from '../../common/interfaces'
import styled from 'styled-components'

const Attribute = styled.div`
  width: 7vw;
`

const Game = styled.div`
  display: flex;
  justify-content: space-evenly;
  background-color: #2f3241;
  color: white;
`

export default function SchedulePage() {
  const [scheduleMap, setScheduleMap] = React.useState<Map<string, PlannedMatch>>();
  const [teams, setTeams] = React.useState<Map<string, Team>>(new Map());
  const [officials, setOfficials] = React.useState<Official[]>([]);

  React.useEffect(() => {
    window.ipc.on(RESPONSE_SCHEDULE, (schedule: PlannedMatch[]) => {
      const map = new Map<string, PlannedMatch>();
      schedule.forEach((match) => { map.set(match.wedstrijd.code, match) })
      console.log("Wedstrijden van de backend!")
      setScheduleMap(map)
    })
    window.ipc.on(RESPONSE_SCHEDULE_SAVE, (message: string) => {
      alert(message)
    })
    window.ipc.on(RESPONSE_OFFICIALS, (teams: Team[]) => {
      const result = teams
        .sort((a, b) => a.naam.localeCompare(b.naam))
        .reduce((map, obj) => (map[obj.naam] = obj, map), new Map<string, Team>());
      setTeams(result)
      setOfficials(teams.flatMap((team) => team.officials))
    })
    window.ipc.send(REQUEST_OFFICIALS, undefined)
    window.ipc.send(REQUEST_SCHEDULE, undefined)
  }, [])

  const renderOfficialSelectionMenu = (callback: (naam: string) => void, current: Official | undefined) => {
    return (
      <select
        value={(current && current.naam) || "Geen"}
        onChange={(event) => { callback(event.target.value) }}
      >
        {
          Object.values(teams).map((team: Team) => {
            return (
              <optgroup label={team.naam}>
                {
                  team.officials.map((official) => {
                    return (
                      <option value={official.naam}>{official.naam}</option>
                    )
                  })
                }
              </optgroup>
            )
          })
        }
      </select>
    )
  }

  const convertMapToComponents = () => {

    const handleTellerChange = (gameCode, value) => {
      const newEntry = scheduleMap.get(gameCode)
      const official = officials.find((official) => official.naam === value)
      newEntry.teller = official;
      setScheduleMap((map) => new Map(map.set(gameCode, newEntry)))
      window.ipc.send(REQUEST_UPDATE_SCHEDULE, Array.from(scheduleMap.values()))
    }

    const handleScheidsrechterChange = (gameCode, value) => {
      console.log("Updating scheidsrechter: " + JSON.stringify(value))
      const newEntry = scheduleMap.get(gameCode)
      newEntry.scheidsrechter = officials.find((official) => official.naam === value)
      setScheduleMap((map) => new Map(map.set(gameCode, newEntry)))
      window.ipc.send(REQUEST_UPDATE_SCHEDULE, Array.from(scheduleMap.values()))
    }

    return Array.from(scheduleMap.entries()).map(([code, game]) => {
      console.log(Object.values(teams).find((team) => team.naam === game.wedstrijd.thuisTeam))
      return (
        <Game>
          <Attribute>{game.wedstrijd.datum}</Attribute>
          <Attribute>{game.wedstrijd.tijd}</Attribute>
          <Attribute>{game.wedstrijd.veld}</Attribute>
          <Attribute>{game.wedstrijd.thuisTeam}</Attribute>
          <Attribute>{game.wedstrijd.uitTeam}</Attribute>
          <Attribute>{Object.values(teams).find((team) => team.naam === game.wedstrijd.thuisTeam)?.coach ?? "Geen"}</Attribute>
          { /** Scheidsrechter */ renderOfficialSelectionMenu((official) => handleScheidsrechterChange(code, official), game.scheidsrechter)}
          { /** Teller */ renderOfficialSelectionMenu((official) => handleTellerChange(code, official), game.teller)}
        </Game>
      )
    })
  }

  const renderSchedule = () => {
    return (
      <>
        {
          convertMapToComponents()
        }
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
        <button
          onClick={() => {
            window.ipc.send(REQUEST_OPEN_SCHEDULE, undefined)
          }}
        >
          Select schedule file
        </button>
      </div>
      <div>
        {scheduleMap && renderSchedule()}
      </div>
      <div>
        <button
          onClick={() => {
            window.ipc.send(REQUEST_UPDATE_SCHEDULE, Array.from(scheduleMap.values()))
          }}
        >
          Update schedule
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            window.ipc.send(REQUEST_SAVE_SCHEDULE, undefined)
          }}
        >
          Save schedule
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            window.ipc.send(REQUEST_EXPORT_SCHEDULE, undefined)
          }}
        >
          Export schedule
        </button>
      </div>
    </React.Fragment>
  )
}
