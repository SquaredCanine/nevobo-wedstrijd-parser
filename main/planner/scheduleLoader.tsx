import XLSX from 'xlsx'
import { GameEntry, PlannedMatch } from '../../common/interfaces'
import fs from 'fs'
import os from 'os'

export class ScheduleLoader {
    //TODO: Ability to list all schedules.
    //TODO: Internal memory of a file.
    //TODO: Ability to read and write to disk.
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

    export(file: string) {
        const header = ["", "Thuiswedstrijdenoverzicht Servia 2e helft seizoen 2023-2024"]
        const subTitle = ["", "Versie n, uitgebracht op xx-xx-xxxx"]
        const entryHeader = ["", "Datum", "Tijd", "Veld", "Team thuis", "Team uit", "Coach", "Eerste scheidsrechter", "Teller"]
        const groupedByDate = this.schedule.wedstrijden.reduce((map, match) => {
            const { wedstrijd } = match;
            map[wedstrijd.datum] = map[wedstrijd.datum] ?? [];
            map[wedstrijd.datum].push(match);
            return map;
        }, new Map<string, PlannedMatch[]>())
        let data = [header, subTitle]
        let rowsToExtend = [0, 1]
        Object.entries(groupedByDate).forEach(([key, matches], index) => {
            const oldLength = data.length
            rowsToExtend.push(...[oldLength, oldLength + 1])
            let newData = [ //Create the structure
                ["", ""], //Empty divider
                ["", `${key} Competitie`], //Date header
                entryHeader //Column header
            ]
            matches.forEach((indeling) => {
                newData.push(
                    [
                        key,
                        indeling.wedstrijd.tijd,
                        indeling.wedstrijd.thuisTeam,
                        indeling.wedstrijd.uitTeam,
                        "COACH",
                        indeling.scheidsrechter.team,
                        indeling.teller.team
                    ]
                )
            })
            data.push(...newData)
        })
        const worksheet = XLSX.utils.json_to_sheet(
            data
            , { skipHeader: true })
            worksheet['!merges'] = []
            worksheet['!merges'].push(...rowsToExtend.map((r) => {
            return {
                s: { r, c: 1 }, // s ("start"): B
                e: { r, c: 8 }  // e ("end"): I
            }   
        }))
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Schema");
        XLSX.writeFile(workbook, file, { compression: true });
    }
}