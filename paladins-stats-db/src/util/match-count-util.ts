import { AggregationPipelineBuilder } from "../database/aggregation-pipeline-builder";
import { PaladinsStatsCollections, PaladinsStatsDatabase, getPaladinsStatsDatabaseConnection } from "../database/paladins-stats-db";
import { ChampionItemMatchCount } from "../models/aggregations/champion-item-match-count";
import { MatchCount } from "../models/aggregations/match-count";
import { MatchCountFilter } from "../models/filter/match-count-filter";


let paladinsStatsDB: PaladinsStatsDatabase;

async function getPaladinsStatsDb() {
    if (!paladinsStatsDB) {
        paladinsStatsDB = await getPaladinsStatsDatabaseConnection();
    }
    return paladinsStatsDB;
}

async function getCount(collectionEnum: PaladinsStatsCollections, filter: MatchCountFilter): Promise<MatchCount> {
    const db = await getPaladinsStatsDb();
    const dal = db.getDal(collectionEnum);

    const pipelineBuilder = new AggregationPipelineBuilder().match(dal.buildMatch(filter));
    if (!filter.championId) {
        pipelineBuilder.group({'id':'$matchId'});
    }
    const pipeline = pipelineBuilder.count().build();

    const result = await dal.aggregate<MatchCount>(pipeline);
    return result[0] ?? { count: 0 };
}

async function getCounts(collectionEnum: PaladinsStatsCollections, filter: MatchCountFilter): Promise<MatchCount[]> {
    const db = await getPaladinsStatsDb();
    const dal = db.getDal(collectionEnum);

    const pipeline = new AggregationPipelineBuilder()
        .match(dal.buildMatch(filter))
        .groupedCount({'id': '$championId', 'name': '$championName'})
        .projectIdFieldsOnRootLevel()
        .build();

    return await dal.aggregate<MatchCount>(pipeline);
}

export async function getMatchCount(filter: MatchCountFilter): Promise<MatchCount> {
    return getCount(PaladinsStatsCollections.CHAMPION_MATCHES, filter);
}

export async function getMatchCountForAllChampions(filter: MatchCountFilter): Promise<MatchCount[]> {
    return getCounts(PaladinsStatsCollections.CHAMPION_MATCHES, filter);
}

export async function getTalentMatchCount(filter: MatchCountFilter): Promise<ChampionItemMatchCount[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .groupedCount({
            'id': '$talent.id',
            'name': '$talent.name',
            'championId': '$championId',
            'championName': '$championName'
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<ChampionItemMatchCount>(pipeline);
}


export async function getCardMatchCount(filter: MatchCountFilter): Promise<ChampionItemMatchCount[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .unwind('$cards')
        .groupedCount({
            'id': '$cards.id',
            'name': '$cards.name',
            'championId': '$championId',
            'championName': '$championName'
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<ChampionItemMatchCount>(pipeline);
}

export async function getItemMatchCount(filter: MatchCountFilter): Promise<MatchCount[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .unwind('$items')
        .groupedCount({
            'id': '$items.id',
            'name': '$items.name'  
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<ChampionItemMatchCount>(pipeline);
}

export async function getBanCount(filter: MatchCountFilter): Promise<MatchCount> {
    return getCount(PaladinsStatsCollections.CHAMPION_BANS, filter);
}

export async function getBanCountForAllChampions(filter: MatchCountFilter): Promise<MatchCount[]> {
    return getCounts(PaladinsStatsCollections.CHAMPION_BANS, filter);
}
