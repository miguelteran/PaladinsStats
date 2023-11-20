import { BaseModel } from "./base-model";


export interface ChampionBan extends BaseModel {
    championId: number;
    championName: string;
    matchId: number;
    matchTimestamp: string;
    region: string;
    map: string;
    ranks: number[];
    platforms: string[];
}
