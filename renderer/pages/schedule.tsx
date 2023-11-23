import React from 'react'
import Head from 'next/head'
import NavBar from '../components/NavBar'
import { REQUEST_OPEN_SCHEDULE, REQUEST_SAVE_SCHEDULE, REQUEST_UPDATE_SCHEDULE, RESPONSE_SCHEDULE, RESPONSE_SCHEDULE_SAVE } from '../../common/events'
import { PlannedMatch } from '../../common/interfaces'
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
  //TODO Load a schedule and edit it.
  //TODO Send new schedule to backend for saving.
  const [scheduleMap, setScheduleMap] = React.useState<Map<string, PlannedMatch>>();

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
  }, [])

  const convertMapToComponents = () => {
    let components = []
    const handleTellerChange = (gameCode, value) => {
      const newEntry = scheduleMap.get(gameCode)
      if (!newEntry.teller) {
        newEntry.teller = {naam: ""}
      }
      newEntry.teller.naam = value;
      setScheduleMap((map) => new Map(map.set(gameCode, newEntry)))
    }
    const handleScheidsrechterChange = (gameCode, value) => {
      const newEntry = scheduleMap.get(gameCode)
      if (!newEntry.scheidsrechter) {
        newEntry.scheidsrechter = {team: "", naam: "", licentieNiveau: "0"}
      }
      newEntry.scheidsrechter.naam = value;
      setScheduleMap((map) => new Map(map.set(gameCode, newEntry)))
    }
    scheduleMap.forEach((game, code) => {
      components.push(
        <Game>
          <Attribute>{game.wedstrijd.datum}</Attribute>
          <Attribute>{game.wedstrijd.tijd}</Attribute>
          <Attribute>{game.wedstrijd.veld}</Attribute>
          <Attribute>{game.wedstrijd.thuisTeam}</Attribute>
          <Attribute>{game.wedstrijd.uitTeam}</Attribute>
          <Attribute>COACH</Attribute>
          <input
            type="text"
            value={(game.scheidsrechter && game.scheidsrechter.naam) || "vul in!"}
            onChange={(e) => { handleScheidsrechterChange(code, e.target.value) }}
          />
          <input
            type="text"
            value={(game.teller && game.teller.naam) || "vul in!"}
            onChange={(e) => handleTellerChange(code, e.target.value)} />
        </Game>
      )
    })
    return components
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
            window.ipc.send(REQUEST_UPDATE_SCHEDULE, [Array.from(scheduleMap.values())])
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
    </React.Fragment>
  )
}
