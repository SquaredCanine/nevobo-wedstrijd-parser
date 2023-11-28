import { dialog } from "electron";
import { REQUEST_EXPORT_SCHEDULE } from "../../common/events";
import { exportToExcel } from "./export";
import { openSchedule } from "../planner/eventHandlers";
import { organization } from "../organization/eventHandlers";

const selectScheduleExportFile = (): string | undefined => {
    return dialog.showSaveDialogSync({
        title: "Waar wil je het naartoe exporteren?",
        filters: [{ name: "Excel", extensions: ['xlsx'] }]
    })
}

export function initializeExportEventHandlers(ipcMain: Electron.IpcMain) {

    ipcMain.on(REQUEST_EXPORT_SCHEDULE, async (event, args) => {
        const saveFile = selectScheduleExportFile()
        if (openSchedule && organization && saveFile) {
            exportToExcel(saveFile, openSchedule.getWedstrijden(), organization.getTeams())
        }
    })

}