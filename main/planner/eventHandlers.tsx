import { dialog } from "electron";
import { REQUEST_OPEN_SCHEDULE, REQUEST_SAVE_SCHEDULE, REQUEST_SCHEDULE, REQUEST_UPDATE_SCHEDULE, RESPONSE_SCHEDULE } from "../../common/events";
import { ScheduleLoader } from "./scheduleLoader";

let openSchedule: ScheduleLoader | undefined = undefined

const getScheduleFile = (): string[] | undefined => {
    return dialog.showOpenDialogSync({
        title: "Kies je schema bestand",
        filters: [{ name: "Excel", extensions: ['xlsx'] }, { name: "Json", extensions: ['json'] }],
        properties: ["openFile"]
    })
}


export function initializeScheduleEventHandlers(ipcMain: Electron.IpcMain) {

    ipcMain.on(REQUEST_OPEN_SCHEDULE, async (event, _) => {
        const files = getScheduleFile();
        if (files) {
            const file = files[0]
            if (file.includes(".json")) {
                openSchedule = new ScheduleLoader(undefined, file)
            } else {
                openSchedule = new ScheduleLoader(file, undefined)
            }
        }
        if (openSchedule) {
            event.reply(RESPONSE_SCHEDULE, openSchedule.schedule.wedstrijden)
        }
    })

    ipcMain.on(REQUEST_SAVE_SCHEDULE, async (event, arg) => {
        if (openSchedule) {
            openSchedule.save()
        }
    })

    ipcMain.on(REQUEST_UPDATE_SCHEDULE, async (event, wedstrijden) => {
        if (openSchedule) {
            openSchedule.update(wedstrijden)
        }
    })

    ipcMain.on(REQUEST_SCHEDULE, async (event, arg) => {
        if (openSchedule) {
            console.log("Responding to request")
            event.reply(RESPONSE_SCHEDULE, openSchedule.schedule.wedstrijden)
        }
    })
}