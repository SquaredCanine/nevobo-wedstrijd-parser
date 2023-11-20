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

export interface PlannedMatch {
    //TODO Match a game entry to a scheidsrechter and teller
}