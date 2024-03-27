import { AggregationPipelineBuilder } from "../database/aggregation-pipeline-builder";
import { PaladinsStatsCollections, PaladinsStatsDatabase, getPaladinsStatsDatabaseConnection } from "../database/paladins-stats-db";
import { BaseAggregationResult } from "../models/aggregations/base-aggregation-result";
import { CardsAggregrationResult } from "../models/aggregations/cards-aggregation-result";
import { ChampionsAggregrationResult } from "../models/aggregations/champions-aggregation-result";
import { ItemsAggregrationResult } from "../models/aggregations/items-aggregation-result";
import { TalentsAggregrationResult } from "../models/aggregations/talents-aggregation-result";
import { CountFilter } from "../models/count-filter";
import { CountResult } from "../models/count-result";


let paladinsStatsDB: PaladinsStatsDatabase;

async function getPaladinsStatsDb() {
    if (!paladinsStatsDB) {
        paladinsStatsDB = await getPaladinsStatsDatabaseConnection();
    }
    return paladinsStatsDB;
}

async function getMatchCount(collectionEnum: PaladinsStatsCollections, filter: CountFilter): Promise<BaseAggregationResult[]> {
    const db = await getPaladinsStatsDb();
    const dal = db.getDal(collectionEnum);

    const pipelineBuilder = new AggregationPipelineBuilder().match(dal.buildMatch(filter));
    if (!filter.championId) {
        pipelineBuilder.group({'id':'$matchId'});
    }
    const pipeline = pipelineBuilder.count().build();

    return await dal.aggregate<BaseAggregationResult>(pipeline);
}

async function getChampionCount(collectionEnum: PaladinsStatsCollections, filter: CountFilter): Promise<BaseAggregationResult[]> {
    const db = await getPaladinsStatsDb();
    const dal = db.getDal(collectionEnum);

    const pipeline = new AggregationPipelineBuilder()
        .match(dal.buildMatch(filter))
        .groupedCount({'championId': '$championId', 'championName': '$championName'})
        .projectIdFieldsOnRootLevel()
        .build();

    return await dal.aggregate<ChampionsAggregrationResult>(pipeline);
}

export async function getTotalMatchCount(filter: CountFilter): Promise<BaseAggregationResult[]> {
    return getMatchCount(PaladinsStatsCollections.CHAMPION_MATCHES, filter);
}

export async function getMatchCountForAllChampions(filter: CountFilter): Promise<BaseAggregationResult[]> {
    return getChampionCount(PaladinsStatsCollections.CHAMPION_MATCHES, filter);
}

export async function getTalentMatchCount(filter: CountFilter): Promise<BaseAggregationResult[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .groupedCount({
            'talentId': '$talent.id',
            'talentName': '$talent.name',
            'championId': '$championId',
            'championName': '$championName'
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<TalentsAggregrationResult>(pipeline);
}


export async function getCardMatchCount(filter: CountFilter): Promise<BaseAggregationResult[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .unwind('$cards')
        .groupedCount({
            'cardId': '$cards.id',
            'cardName': '$cards.name',
            'championId': '$championId',
            'championName': '$championName'
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<CardsAggregrationResult>(pipeline);
}

export async function getItemCount(filter: CountFilter): Promise<BaseAggregationResult[]> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);

    const pipeline = new AggregationPipelineBuilder()
        .match(championMatchesDAL.buildMatch(filter))
        .unwind('$items')
        .groupedCount({
            'itemId': '$items.id',
            'itemName': '$items.name'  
        })
        .projectIdFieldsOnRootLevel()
        .build();

    return await championMatchesDAL.aggregate<ItemsAggregrationResult>(pipeline);
}

export async function getBanCount(filter: CountFilter): Promise<BaseAggregationResult[]> {
    return getMatchCount(PaladinsStatsCollections.CHAMPION_BANS, filter);
}

export async function getBanCountForAllChampions(filter: CountFilter): Promise<BaseAggregationResult[]> {
    return getChampionCount(PaladinsStatsCollections.CHAMPION_BANS, filter);
}

function getCountResults(totalCounts: BaseAggregationResult[], partialCounts: BaseAggregationResult[], entity: string, joinField?: string, includeChampionFields?: boolean): CountResult[] {
    return partialCounts.map(partial => {
        return {
            id: Number(partial[entity + 'Id']),
            name: String(partial[entity + 'Name']),
            partial: partial.count,
            total: joinField ? totalCounts.find(total => total[joinField] === partial[joinField] && total['championId'] === partial['championId'])!.count : totalCounts[0].count,
            championId: includeChampionFields ? Number(partial['championId']) : undefined,
            championName: includeChampionFields ? String(partial['championName']) : undefined
        }
    });
}

export async function getChampionPickCounts(filter: CountFilter) {
    const totalCount = await getTotalMatchCount(filter);
    const partialCounts = await getMatchCountForAllChampions(filter);
    return getCountResults(totalCount, partialCounts, 'champion');  
}

export async function getChampionWinCounts(filter: CountFilter) {
    const totalCount = await getMatchCountForAllChampions(filter);
    const partialCounts = await getMatchCountForAllChampions({...filter, matchResult: 'Winner'});
    return getCountResults(totalCount, partialCounts, 'champion', 'championId');  
}

export async function getChampionBanCounts(filter: CountFilter) {
    const totalCount = await getTotalMatchCount(filter);
    const partialCounts = await getBanCountForAllChampions(filter);
    return getCountResults(totalCount, partialCounts, 'champion');  
}

export async function getTalentPickCounts(filter: CountFilter) {
    const totalCount = await getMatchCountForAllChampions(filter);
    const partialCounts = await getTalentMatchCount(filter);
    return getCountResults(totalCount, partialCounts, 'talent', 'championId', true);  
}

export async function getTalentWinCounts(filter: CountFilter) {
    const totalCount = await getTalentMatchCount(filter);
    const partialCounts = await getTalentMatchCount({...filter, matchResult: 'Winner'});
    return getCountResults(totalCount, partialCounts, 'talent', 'talentId', true);  
}

export async function getCardPickCounts(filter: CountFilter) {
    const totalCount = await getMatchCountForAllChampions(filter);
    const partialCounts = await getCardMatchCount(filter);
    return getCountResults(totalCount, partialCounts, 'card', 'championId', true);  
}
