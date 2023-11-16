import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { REQUEST_OPEN_FILE_1, REQUEST_OPEN_FILE_2, RESPONSE_DIFFERENCE, RESPONSE_OPEN_FILE_1, RESPONSE_OPEN_FILE_2 } from '../../common/events'

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
    window.ipc.on(RESPONSE_DIFFERENCE, (addedGames: any[], removedGames: any[], changedGames: any[]) => {
      setAdditions(addedGames)
      setDeletions(removedGames)
      setChanges(changedGames)
    })
  }, [])


  return (
    <React.Fragment>
      <Head>
        <title>Home - Nextron (basic-lang-typescript)</title>
      </Head>
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -
          <Link href="/next">
            <a>Go to next page</a>
          </Link>
        </p>
        <Image
          src="/images/logo.png"
          alt="Logo image"
          width="256px"
          height="256px"
        />
      </div>
      <div>
        <button
          onClick={() => {
            window.ipc.send('message', 'Hello')
          }}
        >
          Test IPC
        </button>
        <p>{message}</p>
      </div>
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
        { (!deletions || !additions || !changes) && <>Selecteer 2 bestanden alstublieft<br /></>}
        Deleted games:
        { deletions && deletions.map((object) => JSON.stringify(object)) }
        <br />
        Added games:
        { additions && additions.map((object) => JSON.stringify(object)) }
        <br />
        Changed games:
        { changes && changes.map((object) => JSON.stringify(object)) }
        <br />
      </div>
    </React.Fragment>
  )
}
