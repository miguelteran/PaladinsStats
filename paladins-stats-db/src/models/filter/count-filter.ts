import { MatchResult } from "../champion-match";
import { PaladinsRank } from "../paladins-rank";


export interface CountFilter {
    [key: string]: number|string|PaladinsRank|undefined;
    championId?: number
    region?: string;
    map?: string;
    platform?: string;
    rank?: PaladinsRank;
    matchResult?: MatchResult;
}
