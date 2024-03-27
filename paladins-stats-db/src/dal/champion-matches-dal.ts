import { Collection, Document } from "mongodb";
import { BaseDAL } from "./base-dal";
import { MatchBuilder } from "../database/match-builder";
import { ChampionMatch } from "../models/champion-match";
import { getRankBoundaries } from "../models/paladins-rank";
import { CountFilter } from "../models/count-filter";


export class ChampionMatchesDAL extends BaseDAL<ChampionMatch> {

    constructor(collection: Collection<ChampionMatch>) {
        super(collection);
    }

    buildMatch(filter: CountFilter): Document {
        const matchBuilder = new MatchBuilder();
        Object.keys(filter).forEach(key => {
            const value = filter[key];
            if (value) {
                if (key === 'rank') {
                    const rankIds = getRankBoundaries(value as number);
                    if (rankIds.length === 1) {
                        matchBuilder.eq('rank', rankIds[0])
                    } else {
                        matchBuilder.gte('rank', rankIds[0]).lte('rank', rankIds[1]);
                    }
                } else {
                    matchBuilder.eq(key, value);
                }
            }
        });
        return matchBuilder.build();
    }
}
