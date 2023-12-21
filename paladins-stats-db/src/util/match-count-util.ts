import { AggregationPipelineBuilder } from "../database/aggregation-pipeline-builder";
import { PaladinsStatsCollections, PaladinsStatsDatabase, getPaladinsStatsDatabaseConnection } from "../database/paladins-stats-db";
import { ChampionItemMatchCount } from "../models/aggregations/champion-item-match-count";
import { MatchCount } from "../models/aggregations/match-count";
import { MatchCountFilter } from "../models/filter/match-count-filter";
import { getRankBoundaries, getRankFromString } from "../models/paladins-rank";


let paladinsStatsDB: PaladinsStatsDatabase;

async function getPaladinsStatsDb() {
    if (!paladinsStatsDB) {
        paladinsStatsDB = await getPaladinsStatsDatabaseConnection();
    }
    return paladinsStatsDB;
}

function buildMatchObject(filter: MatchCountFilter) {
    const match: any = {};
    Object.keys(filter).forEach(key => {
        const value = filter[key];
        if (value) {
            if (key === 'rank') {
                const rankIds = getRankBoundaries(value as number);
                match['rank'] = rankIds.length === 1 ? rankIds[0] : {'$gte': rankIds[0], '$lte': rankIds[1]}
            } else {
                match[key] = value;
            }
        }
    });
    return match;
}

export async function getMatchCount(filter: MatchCountFilter): Promise<MatchCount> {
    const pipelineBuilder = new AggregationPipelineBuilder().match(buildMatchObject(filter));
    if (!filter.championId) {
        pipelineBuilder.group({'id':'$matchId'});
    }
    const pipeline = pipelineBuilder.count().build();
    const db = await getPaladinsStatsDb();
    const result = await db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES).aggregate<MatchCount>(pipeline);
    return result[0] ?? {count: 0};
}

export async function getMatchCountForAllChampions(filter: MatchCountFilter): Promise<MatchCount[]> {
    const pipeline = new AggregationPipelineBuilder()
        .match(buildMatchObject(filter))
        .groupedCount({'id': '$championId', 'name': '$championName'})
        .projectIdFieldsOnRootLevel()
        .build();
    const db = await getPaladinsStatsDb();
    return await db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES).aggregate<MatchCount>(pipeline);
}

export async function getTalentMatchCount(filter: MatchCountFilter): Promise<ChampionItemMatchCount[]> {
    const pipeline = new AggregationPipelineBuilder()
        .match(buildMatchObject(filter))
        .groupedCount({
            'id': '$talent.id',
            'name': '$talent.name',
            'championId': '$championId',
            'championName': '$championName'
        })
        .projectIdFieldsOnRootLevel()
        .build();
    const db = await getPaladinsStatsDb();
    return await db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES).aggregate<ChampionItemMatchCount>(pipeline);
}


export async function getCardMatchCount(filter: MatchCountFilter): Promise<ChampionItemMatchCount[]> {
    const pipeline = new AggregationPipelineBuilder()
        .match(buildMatchObject(filter))
        .unwind('$cards')
        .groupedCount({
            'id': '$cards.id',
            'name': '$cards.name',
            'championId': '$championId',
            'championName': '$championName'
        })
        .projectIdFieldsOnRootLevel()
        .build();
    const db = await getPaladinsStatsDb();
    return await db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES).aggregate<ChampionItemMatchCount>(pipeline);
}

export async function getItemMatchCount(filter: MatchCountFilter): Promise<MatchCount[]> {
    const pipeline = new AggregationPipelineBuilder()
        .match(buildMatchObject(filter))
        .unwind('$items')
        .groupedCount({
            'id': '$items.id',
            'name': '$items.name'  
        })
        .projectIdFieldsOnRootLevel()
        .build();
    const db = await getPaladinsStatsDb();
    return await db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES).aggregate<ChampionItemMatchCount>(pipeline);
}
