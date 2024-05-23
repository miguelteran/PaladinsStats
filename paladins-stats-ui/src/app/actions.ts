'use server'

import { BaseAggregationResult } from '@/models/aggregations/base-aggregation-result';
import { CardsAggregrationResult } from '@/models/aggregations/cards-aggregation-result';
import { ChampionsAggregrationResult } from '@/models/aggregations/champions-aggregation-result';
import { TalentsAggregrationResult } from '@/models/aggregations/talents-aggregation-result';
import { getPlayerBatch, searchPlayers } from '@miguelteran/paladins-api-wrapper';
import { AggregationPipelineBuilder, ChampionMatch, PaladinsStatsCollections, PaladinsStatsDatabase, getPaladinsStatsDatabaseConnection } from '@miguelteran/paladins-stats-db';
import { StatsCategory } from '../models/stats-category';
import { NamedSelectItem } from '@/components/select';
import { CountFilter } from '@/models/count-filter';
import { ItemsAggregrationResult } from '@/models/aggregations/items-aggregation-result';
import { StatsDateRange } from '@/models/stats-date-range';
import { CountResult } from '@/models/count-result';


let paladinsStatsDB: PaladinsStatsDatabase;


export async function getPlayerSearchResult(playerName: string) {
    return await searchPlayers(playerName);
}

export async function getPlayers(playerIds: string[]) {
    return await getPlayerBatch(playerIds);
}

export async function getCountResults(statsCategory: StatsCategory, filter: CountFilter) {
    switch (statsCategory) {
        case StatsCategory.ChampionPicks:
            return await getChampionPickCounts(filter);
        case StatsCategory.ChampionWins:
            return await getChampionWinCounts(filter);
        case StatsCategory.ChampionBans:
            return await getChampionBanCounts(filter);
        case StatsCategory.ChampionCards:
            return await getCardPickCounts(filter);
        case StatsCategory.TalentPicks:
            return await getTalentPickCounts(filter);
        case StatsCategory.TalentWins:
            return await getTalentWinCounts(filter);
    }
}

export async function getItemPicks(filter: CountFilter) {
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

export async function getStatsDateRange(): Promise<StatsDateRange> {
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);
    const oldestMatch = await championMatchesDAL.aggregate<ChampionMatch>(new AggregationPipelineBuilder().sort({matchId: 1}).limit(1).build());
    const mostRecentMatch = await championMatchesDAL.aggregate<ChampionMatch>(new AggregationPipelineBuilder().sort({matchId: -1}).limit(1).build());
    return {
        startDate: getMatchDate(oldestMatch[0]),
        endDate: getMatchDate(mostRecentMatch[0])
    }
}

export async function getRankedMaps(): Promise<NamedSelectItem[]> {
    let mapId = 1;
    const db = await getPaladinsStatsDb();
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);
    const pipeline = new AggregationPipelineBuilder().group('$map').build();
    return (await championMatchesDAL.aggregate(pipeline)).map(m => {
        const map = { id: mapId, name: m._id };
        mapId += 1;
        return map;
    });
}

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

async function getTotalMatchCount(filter: CountFilter): Promise<BaseAggregationResult[]> {
    return getMatchCount(PaladinsStatsCollections.CHAMPION_MATCHES, filter);
}

async function getMatchCountForAllChampions(filter: CountFilter): Promise<BaseAggregationResult[]> {
    return getChampionCount(PaladinsStatsCollections.CHAMPION_MATCHES, filter);
}

async function getTalentMatchCount(filter: CountFilter): Promise<BaseAggregationResult[]> {
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


async function getCardMatchCount(filter: CountFilter): Promise<BaseAggregationResult[]> {
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

async function getBanCountForAllChampions(filter: CountFilter): Promise<BaseAggregationResult[]> {
    return getChampionCount(PaladinsStatsCollections.CHAMPION_BANS, filter);
}

function getCounts(totalCounts: BaseAggregationResult[], partialCounts: BaseAggregationResult[], entity: string, joinField?: string, includeChampionFields?: boolean): CountResult[] {
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

async function getChampionPickCounts(filter: CountFilter) {
    const totalCount = await getTotalMatchCount(filter);
    const partialCounts = await getMatchCountForAllChampions(filter);
    return getCounts(totalCount, partialCounts, 'champion');  
}

async function getChampionWinCounts(filter: CountFilter) {
    const totalCount = await getMatchCountForAllChampions(filter);
    const partialCounts = await getMatchCountForAllChampions({...filter, matchResult: 'Winner'});
    return getCounts(totalCount, partialCounts, 'champion', 'championId');  
}

async function getChampionBanCounts(filter: CountFilter) {
    const totalCount = await getTotalMatchCount(filter);
    const partialCounts = await getBanCountForAllChampions(filter);
    return getCounts(totalCount, partialCounts, 'champion');  
}

async function getTalentPickCounts(filter: CountFilter) {
    const totalCount = await getMatchCountForAllChampions(filter);
    const partialCounts = await getTalentMatchCount(filter);
    return getCounts(totalCount, partialCounts, 'talent', 'championId', true);  
}

async function getTalentWinCounts(filter: CountFilter) {
    const totalCount = await getTalentMatchCount(filter);
    const partialCounts = await getTalentMatchCount({...filter, matchResult: 'Winner'});
    return getCounts(totalCount, partialCounts, 'talent', 'talentId', true);  
}

async function getCardPickCounts(filter: CountFilter) {
    const totalCount = await getMatchCountForAllChampions(filter);
    const partialCounts = await getCardMatchCount(filter);
    return getCounts(totalCount, partialCounts, 'card', 'championId', true);  
}

function getMatchDate(match: ChampionMatch) {
    return match.matchTimestamp.split(' ')[0];
}
