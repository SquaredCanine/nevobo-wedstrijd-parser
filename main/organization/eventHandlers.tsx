import { dialog } from "electron";
import { REQUEST_OFFICIALS, REQUEST_OFFICIALS_OPEN, REQUEST_OFFICIALS_SAVE, REQUEST_OFFICIALS_UPDATE, RESPONSE_OFFICIALS } from "../../common/events";
import { Organization } from "./organization";
import { Team } from "../../common/interfaces";

export let organization: Organization | undefined = undefined

const getRefereeFile = (): string[] | undefined => {
    return dialog.showOpenDialogSync({
        title: "Kies je scheidsrechters excel bestand",
        filters: [{ name: "JSON", extensions: ['json'] }, { name: "Excel", extensions: ['xlsx'] }],
        properties: ["openFile"]
    })
}

export function initializeOrgEventHandlers(ipcMain: Electron.IpcMain) {

    const sendTeams = (event: Electron.IpcMainEvent) => {
        if (organization) {
            event.reply(RESPONSE_OFFICIALS, organization.getTeams())
        }
    }

    ipcMain.on(REQUEST_OFFICIALS_OPEN, async (event, _) => {
        const files = getRefereeFile();
        if (files) {
            organization = new Organization(files[0])
        }
        sendTeams(event)
    })

    ipcMain.on(REQUEST_OFFICIALS, async (event, scheduleFile) => {
        sendTeams(event)
    })

    ipcMain.on(REQUEST_OFFICIALS_UPDATE, async (event, teams: Team[]) => {
        if (organization) {
            organization.update(teams)
        }
        sendTeams(event)
    })

    ipcMain.on(REQUEST_OFFICIALS_SAVE, async (event, _) => {
        if (organization) {
            organization.save()
        }
        sendTeams(event)
    })
}