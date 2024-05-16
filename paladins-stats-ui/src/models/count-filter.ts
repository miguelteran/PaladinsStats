import { MatchResult } from "@miguelteran/paladins-stats-db/dist/src/models/champion-match";
import { PaladinsRank } from "@miguelteran/paladins-stats-db/dist/src/models/paladins-rank";


export interface CountFilter {
    [key: string]: number|string|PaladinsRank|undefined;
    championId?: number
    region?: string;
    map?: string;
    platform?: string;
    rank?: PaladinsRank;
    matchResult?: MatchResult;
}
