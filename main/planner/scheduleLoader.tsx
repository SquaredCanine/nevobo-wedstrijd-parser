import XLSX from 'xlsx'
import { GameEntry, PlannedMatch } from '../../common/interfaces'
import fs from 'fs'
import os from 'os'

export class ScheduleLoader {
    //TODO: Ability to list all schedules.
    static scheduleFolder: string = `${os.homedir()}/.wedstrijdplanner/schemas`
    schedule: { timestamp: string, wedstrijden: PlannedMatch[] }
    scheduleFile: string

    constructor(excelFile?: string, scheduleFile?: string) {
        fs.mkdirSync(ScheduleLoader.scheduleFolder, { recursive: true })
        if (excelFile) {
            const workbook = XLSX.readFile(excelFile);
            const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { raw: false })
            this.schedule = {
                timestamp: Date(),
                wedstrijden: sheet.map((entry) => {
                    return {
                        wedstrijd: ScheduleLoader.convertToGameEntry(entry),
                        scheidsrechter: undefined,
                        teller: undefined
                    }
                })
            }
            this.scheduleFile = `${ScheduleLoader.scheduleFolder}/${new Date().getTime()}.json`
        } else if (scheduleFile) {
            this.schedule = JSON.parse(fs.readFileSync(scheduleFile, 'utf-8'))
            this.scheduleFile = scheduleFile
        }
    }

    update(nieuweWedstrijden: PlannedMatch[]) {
        this.schedule = {
            timestamp: Date(),
            wedstrijden: nieuweWedstrijden
        }
    }

    static convertToGameEntry = (entry: unknown): GameEntry => {
        return {
            datum: entry['Datum'],
            tijd: entry['Tijd'],
            thuisTeam: entry['Team thuis'],
            uitTeam: entry['Team uit'],
            locatie: entry['Locatie'],
            veld: entry['Veld'],
            regio: entry['Regio'],
            poule: entry['Poule'],
            code: entry['Code'],
            zaalCode: entry['Zaalcode'],
            zaal: entry['Zaal'],
            plaats: entry['Plaats']
        }
    }

    save() {
        fs.writeFile(this.scheduleFile, JSON.stringify(this.schedule, undefined, 4), { encoding: 'utf-8' }, (err) => console.log(err))
    }

    getWedstrijden() {
        return this.schedule.wedstrijden;
    }
}