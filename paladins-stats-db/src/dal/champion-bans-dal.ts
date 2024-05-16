import { Collection, Document } from "mongodb";
import { BaseDAL } from "./base-dal";
import { MatchBuilder } from "../database/match-builder";
import { ChampionBan } from "../models/champion-ban";
import { getRankBoundaries } from "../models/paladins-rank";


export class ChampionBansDAL extends BaseDAL<ChampionBan> {

    constructor(collection: Collection<ChampionBan>) {
        super(collection);
    }

    buildMatch(filter: any): Document {
        const matchBuilder = new MatchBuilder();
        Object.keys(filter).forEach(key => {
            const value = filter[key];
            if (value) {
                if (key === 'rank') {
                    const rankIds = getRankBoundaries(value as number);
                    matchBuilder.in('ranks', rankIds);
                } else if (key === 'platform') {
                    matchBuilder.in('platforms', [value]);
                } else {
                    matchBuilder.eq(key, value);
                }
            }
        });
        return matchBuilder.build();
    }
}
