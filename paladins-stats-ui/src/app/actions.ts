'use server'

import { getPlayerBatch, searchPlayers } from '@miguelteran/paladins-api-wrapper';
import { CountFilter, ItemsAggregrationResult, getCardPickCounts, getChampionBanCounts, getChampionPickCounts, getChampionWinCounts, getItemCount, getTalentPickCounts, getTalentWinCounts } from '@miguelteran/paladins-stats-db';
import { StatsCategory } from '../models/stats-category';


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
    return await getItemCount(filter) as ItemsAggregrationResult[];
}