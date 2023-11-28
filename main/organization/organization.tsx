import { Official, Team } from "../../common/interfaces";
import fs from 'fs'
import os from 'os'
import XLSX from 'xlsx'

export class Organization {
    static organizationFolder: string = `${os.homedir()}/.wedstrijdplanner/organisatie`
    organizationFile: string
    private teams: Team[]
    static licentieNiveau = {
        "S-R1": 4,
        "S-R2": 3,
        "S-V4": 2,
        "S-V6": 1
    }

    constructor(file: string) {
        fs.mkdirSync(Organization.organizationFolder, { recursive: true })
        if (file && file.includes('.xlsx')) {
            const workbook = XLSX.readFile(file);
            let officials: Official[] = []
            workbook.SheetNames.forEach((sheetName) => {
                const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { raw: false })
                sheet.forEach((entry) => {
                    officials.push({
                        naam: entry['Volledige naam'],
                        relatiecode: entry['Relatiecode'],
                        licentieNiveau: Organization.licentieNiveau[sheetName] || 0,
                        team: "??"
                    })
                })
            })
            this.teams = [
                {
                    naam: "??",
                    coach: "Geen",
                    officials
                }
            ]
            this.organizationFile = `${Organization.organizationFolder}/${new Date().getTime()}.json`
        } else if (file && file.includes(".json")) {
            this.teams = JSON.parse(fs.readFileSync(file, 'utf-8'))
            this.organizationFile = file
        }
    }

    getTeams() {
        return this.teams;
    }

    update(teams: Team[]) {
        this.teams = teams;
    }

    save() {
        fs.writeFile(this.organizationFile, JSON.stringify(this.teams, undefined, 4), { encoding: 'utf-8' }, (err) => console.log(err))
    }
}
