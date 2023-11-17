import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { REQUEST_OPEN_FILE_1, REQUEST_OPEN_FILE_2, RESPONSE_DIFFERENCE, RESPONSE_OPEN_FILE_1, RESPONSE_OPEN_FILE_2 } from '../../common/events'
import { GameEntry, MatchedGame } from '../../common/interfaces'
import styled from 'styled-components'

const Attribute = styled.div`
  width: 7vw;
`

const DeletedGame = styled.div`
  display: flex;
  justify-content: space-evenly;
  background-color: red;
`

const AddedGame = styled.div`
  display: flex;
  justify-content: space-evenly;
  background-color: green;
`

const ChangedGame = styled.div`
  display: flex;
  justify-content: space-evenly;
  background-color: yellow;
`

export default function HomePage() {
  const [message, setMessage] = React.useState('No message found')
  const [file1, setFile1] = React.useState('Geen bestand geselecteerd')
  const [file2, setFile2] = React.useState('Geen bestand geselecteerd')

  const [additions, setAdditions] = React.useState<any[] | undefined>(undefined)
  const [deletions, setDeletions] = React.useState<any[] | undefined>(undefined)
  const [changes, setChanges] = React.useState<any[] | undefined>(undefined)



  React.useEffect(() => {
    window.ipc.on('message', (message: string) => {
      setMessage(message)
    })
    window.ipc.on(RESPONSE_OPEN_FILE_1, (message: string | undefined) => {
      setFile1(message)
    })
    window.ipc.on(RESPONSE_OPEN_FILE_2, (message: string | undefined) => {
      setFile2(message)
    })
    window.ipc.on(RESPONSE_DIFFERENCE, (addedGames: GameEntry[], removedGames: GameEntry[], changedGames: MatchedGame[]) => {
      setAdditions(addedGames)
      setDeletions(removedGames)
      setChanges(changedGames)
    })
  }, [])

  const renderDeletedGames = (deletedGames: GameEntry[]) => {
    return (
      <>
        {deletedGames.map((game) =>
          <DeletedGame>
            {Object.values(game).map((value) => {
              return <Attribute>{value}</Attribute>
            })}
          </DeletedGame>)}
      </>
    )
  }

  const renderAddedGames = (addedGames: GameEntry[]) => {
    return (
      <>
        {addedGames.map((game) =>
          <AddedGame>
            {Object.values(game).map((value) => {
              return <Attribute>{value}</Attribute>
            })}
          </AddedGame>)}
      </>
    )
  }

  const renderChangedGames = (changedGames: MatchedGame[]) => {
    console.log(changedGames.length)
    return (
      <>
        {changedGames.map(({ oldGame, newGame }) => {
          return (
            <ChangedGame>
              {
                Object.entries(newGame).map(([key, value], index) => {
                  if (oldGame[key] === value) {
                    return <Attribute>{value}</Attribute>
                  } else {
                    return <Attribute><b>{value}</b></Attribute>
                  }
                })
              }
            </ChangedGame>
          )
        })}
      </>
    )
  }

  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (basic-lang-typescript)</title>
      </Head>
      <div>
        <button
          onClick={() => {
            window.ipc.send(REQUEST_OPEN_FILE_1, undefined)
          }}
        >
          Select file 1
        </button>
        <p>{file1}</p>
      </div>
      <div id="asdfasdfasdf">
        <button
          onClick={() => {
            console.log("????")
            window.ipc.send(REQUEST_OPEN_FILE_2, undefined)
          }}
        >
          Select file 2
        </button>
        <p>{file2}</p>
      </div>
      <div>
        {(!deletions || !additions || !changes) && <>Selecteer 2 bestanden alstublieft<br /></>}
        Deleted games:
        {deletions && renderDeletedGames(deletions)}
        <br />
        Added games:
        {additions && renderAddedGames(additions)}
        <br />
        Changed games:
        {changes && renderChangedGames(changes)}
        <br />
      </div>
    </React.Fragment>
  )
}
