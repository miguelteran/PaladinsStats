import { BaseModel } from "./base-model";


export type MatchResult = 'Winner' | 'Loser';

export interface LeveledItem {
    id: number;
    name: string;
    level?: number;
}

export interface ChampionMatch extends BaseModel {
    championId: number;
    championName: string;
    matchId: number;
    matchTimestamp: string;
    matchResult: MatchResult;
    region: string;
    map: string;
    rank: number;
    platform: string;
    talent: LeveledItem;
    cards: LeveledItem[];
    items: LeveledItem[];
}
