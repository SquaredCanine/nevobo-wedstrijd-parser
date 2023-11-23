export interface MatchedGame {
    oldGame: GameEntry,
    newGame: GameEntry
}

export interface GameEntry {
    datum: string,
    tijd: string,
    thuisTeam: string,
    uitTeam: string,
    locatie: string,
    veld: string,
    regio: string,
    poule: string,
    code: string,
    zaalCode: string,
    zaal: string,
    plaats: string
}

export interface Team {
    naam: string,
    officials: Official[]
}

export interface Official {
    naam: string,
    team ?: string
}
 
export interface Scheidsrechter extends Official {
    licentieNiveau: number
}

export interface PlannedMatch {
    wedstrijd: GameEntry,
    teller: Official,
    scheidsrechter: Scheidsrechter
}