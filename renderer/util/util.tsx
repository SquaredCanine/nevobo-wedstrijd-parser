export function licentieNiveauToString(niveau: number): string {
    const licentie = licentieNiveauMap.get(niveau)
    if (licentie) {
        return licentie
    } else {
        return "UNKNOWN"
    }
}

const licentieNiveauMap = new Map([
    [0, "Geen"],
    [1, "S-V6"],
    [2, "S-V4"],
    [3, "S-R2"],
    [4, "S-R1"],
])
