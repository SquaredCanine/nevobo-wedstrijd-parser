import { PlannedMatch, Team } from "../../common/interfaces";
import XLSX from 'xlsx'

export function exportToExcel(file: string, wedstrijden: PlannedMatch[], teams: Team[]) {
    const header = ["", "Thuiswedstrijdenoverzicht Servia 2e helft seizoen 2023-2024"]
    const subTitle = ["", "Versie n, uitgebracht op xx-xx-xxxx"]
    const entryHeader = ["", "Datum", "Tijd", "Veld", "Team thuis", "Team uit", "Coach", "Eerste scheidsrechter", "Teller"]
    const groupedByDate = wedstrijden.reduce((map, match) => {
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
        matches.forEach((indeling: PlannedMatch) => {
            newData.push(
                [
                    "",
                    key,
                    indeling.wedstrijd.tijd,
                    indeling.wedstrijd.veld,
                    indeling.wedstrijd.thuisTeam,
                    indeling.wedstrijd.uitTeam,
                    teams.find((team) => team.naam === indeling.wedstrijd.thuisTeam)?.coach ?? "Geen",
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
    const constantFactor = 3;
    worksheet['!cols'] = []
    worksheet['!cols'][0] = { wpx: 30 * constantFactor } //Links
    worksheet['!cols'][1] = { wpx: 30 * constantFactor } //Datum
    worksheet['!cols'][2] = { wpx: 15 * constantFactor } //Tijd
    worksheet['!cols'][3] = { wpx: 15 * constantFactor } //Veld
    worksheet['!cols'][4] = { wpx: 165 } //Team thuis
    worksheet['!cols'][5] = { wpx: 165 } //Team uit
    worksheet['!cols'][6] = { wpx: 45 * constantFactor } //Coach
    worksheet['!cols'][7] = { wpx: 45 * constantFactor } //Scheids
    worksheet['!cols'][8] = { wpx: 30 * constantFactor } //Teller
    worksheet['!cols'][9] = { wpx: 15 * constantFactor } //Rechts
    worksheet['!rows'] = []
    worksheet['!rows'][0] = { hpt: 150 }
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Schema");
    XLSX.writeFile(workbook, file, { compression: true });
}