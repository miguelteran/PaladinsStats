import { AggregationPipelineBuilder } from "../database/aggregation-pipeline-builder";
import { PaladinsStatsCollections, PaladinsStatsDatabase, getPaladinsStatsDatabaseConnection } from "../database/paladins-stats-db";
import { CountResult } from "../models/aggregations/count-result";
import { CountFilter } from "../models/filter/count-filter";


let paladinsStatsDB: PaladinsStatsDatabase;

async function getPaladinsStatsDb() {
    if (!paladinsStatsDB) {
        paladinsStatsDB = await getPaladinsStatsDatabaseConnection();
    }
    return paladinsStatsDB;
}

async function getMatchCount(collectionEnum: PaladinsStatsCollections, filter: CountFilter): Promise<CountResult[]> {
    const db = await getPaladinsStatsDb();
    const dal = db.getDal(collectionEnum);

    const pipelineBuilder = new AggregationPipelineBuilder().match(dal.buildMatch(filter));
    if (!filter.championId) {
        pipelineBuilder.group({'id':'$matchId'});
    }
    const pipeline = pipelineBuilder.count().build();

    return await dal.aggregate<CountResult>(pipeline);
}

async function getChampionCount(collectionEnum: PaladinsStatsCollections, filter: CountFilter): Promise<CountResult[]> {
    const db = await getPaladinsStatsDb();
    const dal = db.getDal(collectionEnum);

    const pipeline = new AggregationPipelineBuilder()
        .match(dal.buildMatch(filter))
        .groupedCount({'id': '$championId', 'champion': '$championName'})
        .projectIdFieldsOnRootLevel()
        .build();

    return await dal.aggregate<CountResult>(pipeline);
}

export async function getTotalMatchCount(filter: CountFilter): Promise<CountResult[]> {
    return getMatchCount(PaladinsStatsCollections.CHAMPION_MATCHES, filter);
}

export async function getMatchCountForAllChampions(filter: CountFilter): Promise<CountResult[]> {
    return getChampionCount(PaladinsStatsCollections.CHAMPION_MATCHES, filter);
}

export async function getTalentMatchCount(filter: CountFilter): Promise<CountResult[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .groupedCount({
            'id': '$talent.id',
            'talent': '$talent.name',
            'championId': '$championId',
            'champion': '$championName'
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<CountResult>(pipeline);
}


export async function getCardMatchCount(filter: CountFilter): Promise<CountResult[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .unwind('$cards')
        .groupedCount({
            'id': '$cards.id',
            'card': '$cards.name',
            'championId': '$championId',
            'champion': '$championName'
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<CountResult>(pipeline);
}

export async function getItemCount(filter: CountFilter): Promise<CountResult[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .unwind('$items')
        .groupedCount({
            'id': '$items.id',
            'item': '$items.name'  
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<CountResult>(pipeline);
}

export async function getBanCount(filter: CountFilter): Promise<CountResult[]> {
    return getMatchCount(PaladinsStatsCollections.CHAMPION_BANS, filter);
}

export async function getBanCountForAllChampions(filter: CountFilter): Promise<CountResult[]> {
    return getChampionCount(PaladinsStatsCollections.CHAMPION_BANS, filter);
}
