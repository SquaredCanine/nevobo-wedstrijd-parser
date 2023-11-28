import path from 'path'
import { app, dialog, ipcMain } from 'electron'
import serve from 'electron-serve'
import { createWindow } from './helpers'
import { REQUEST_DIFFERENCE, REQUEST_OPEN_FILE_1, REQUEST_OPEN_FILE_2, RESPONSE_DIFFERENCE, RESPONSE_OPEN_FILE_1, RESPONSE_OPEN_FILE_2 } from '../common/events'
import XLSX from 'xlsx'
import { MatchedGame } from '../common/interfaces'
import { ScheduleLoader } from './planner/scheduleLoader'
import { initializeOrgEventHandlers } from './organization/eventHandlers'
import { initializeScheduleEventHandlers } from './planner/eventHandlers'
import { initializeExportEventHandlers } from './export/eventHandlers'

const isProd = process.env.NODE_ENV === 'production'

if (isProd) {
  serve({ directory: 'app' })
} else {
  app.setPath('userData', `${app.getPath('userData')} (development)`)
}

; (async () => {
  await app.whenReady()

  const mainWindow = createWindow('main', {
    width: 1000,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })
  

  if (isProd) {
    mainWindow.removeMenu()
    await mainWindow.loadURL('app://./home')
  } else {
    const port = process.argv[2]
    await mainWindow.loadURL(`http://localhost:${port}/home`)
    mainWindow.webContents.openDevTools()
  }
})()

app.on('window-all-closed', () => {
  app.quit()
})

/**
 * Initialize event handlers
 */

initializeOrgEventHandlers(ipcMain)
initializeScheduleEventHandlers(ipcMain)
initializeExportEventHandlers(ipcMain)

ipcMain.on('message', async (event, arg) => {
  console.log("message!")
  event.reply('message', `${arg} World!`)
})


const getMatchFile = (): string[] | undefined => {
  return dialog.showOpenDialogSync({
    title: "Kies je wedstrijd excel bestand",
    filters: [{ name: "Excel", extensions: ['xlsx'] }],
    properties: ["openFile"]
  })
}

let selectedFile1: string | undefined = undefined
let selectedFile2: string | undefined = undefined

ipcMain.on(REQUEST_OPEN_FILE_1, async (event, arg) => {
  const files = getMatchFile();
  if (files) {
    selectedFile1 = files[0]
  }
  updateDifferences(event)
  event.reply(RESPONSE_OPEN_FILE_1, selectedFile1)
})

ipcMain.on(REQUEST_OPEN_FILE_2, async (event, arg) => {
  const files = getMatchFile();
  if (files) {
    selectedFile2 = files[0]
  }
  updateDifferences(event)
  event.reply(RESPONSE_OPEN_FILE_2, selectedFile2)
})

ipcMain.on(REQUEST_DIFFERENCE, async (event, arg) => {
  updateDifferences(event)
})

const updateDifferences = (event: Electron.IpcMainEvent) => {
  if (!selectedFile1 || !selectedFile2) {
    event.reply(RESPONSE_DIFFERENCE, undefined, undefined, undefined)
  } else {
    const workbook1 = XLSX.readFile(selectedFile1);
    const workbook2 = XLSX.readFile(selectedFile2);
    const sheet1 = XLSX.utils.sheet_to_json(workbook1.Sheets[workbook1.SheetNames[0]], { raw: false })
    const sheet2 = XLSX.utils.sheet_to_json(workbook2.Sheets[workbook2.SheetNames[0]], { raw: false })
    const codes1 = sheet1.map((entry) => entry['Code'])
    const codes2 = sheet2.map((entry) => entry['Code'])
    const addedGames = sheet2.filter((entry) => !codes1.includes(entry['Code'])).map((entry) => ScheduleLoader.convertToGameEntry(entry))
    const removedGames = sheet1.filter((entry) => !codes2.includes(entry['Code'])).map((entry) => ScheduleLoader.convertToGameEntry(entry))
    const changedGames: MatchedGame[] = sheet2.filter((secondEntry) => {
      const code = secondEntry['Code']
      let isSameEntry = true
      if (codes1.includes(code)) {
        const firstEntry = sheet1.find((fullEntry) => fullEntry['Code'] === code)
        isSameEntry = firstEntry['Datum'] === secondEntry['Datum'] &&
          firstEntry['Tijd'] === secondEntry['Tijd'] &&
          firstEntry['Team uit'] === secondEntry['Team uit'] &&
          firstEntry['Veld'] === secondEntry['Veld']
      }
      return !isSameEntry
    }).map((secondEntry) => {
      const firstEntry = sheet1.find((fullEntry) => fullEntry['Code'] === secondEntry['Code'])
      return {
        oldGame: ScheduleLoader.convertToGameEntry(firstEntry),
        newGame: ScheduleLoader.convertToGameEntry(secondEntry)
      }
    })
    event.reply(RESPONSE_DIFFERENCE, addedGames, removedGames, changedGames)
  }
}
