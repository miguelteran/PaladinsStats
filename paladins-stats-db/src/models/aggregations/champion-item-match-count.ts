import { MatchCount } from "./match-count";


export interface ChampionItemMatchCount extends MatchCount {
    championId: number,
    championName: string
}
