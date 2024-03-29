import { PaladinsRoles } from "./role";

export interface ChampionStatsSummary {
    championId: string;
    championName: string;
    championRole: PaladinsRoles
    rank: number;
    numberOfMatches: number;
    winRate: number;
    kda: string;
    kdaRatio: number;
    minutesPlayed: number;
}