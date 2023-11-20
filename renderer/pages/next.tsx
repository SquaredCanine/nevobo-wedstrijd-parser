import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import NavBar from '../components/NavBar'

export default function NextPage() {
  //TODO Load a schedule and edit it.
  //TODO Send new schedule to backend for saving.
  return (
    <React.Fragment>
      <Head>
        <title>Next - Nextron (basic-lang-typescript)</title>
      </Head>
      <NavBar />
      <div>
        <p>
          ⚡ Electron + Next.js ⚡ -
          <Link href="/home">
            Go to home page
          </Link>
        </p>
      </div>
    </React.Fragment>
  )
}
