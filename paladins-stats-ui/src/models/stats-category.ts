export enum StatsCategory {
    ChampionPicks = 0,
    ChampionWins,
    ChampionBans,
    ChampionCards,
    TalentPicks,
    TalentWins,
    Items,
}

export const statsCategories = [
    { id: StatsCategory.ChampionPicks, name: 'Champion Pick Rates' },
    { id: StatsCategory.ChampionWins, name: 'Champion Win Rates' },
    { id: StatsCategory.ChampionBans, name: 'Champion Ban Rates' },
    { id: StatsCategory.ChampionCards, name: 'Champion Cards Pick Rates' },
    { id: StatsCategory.TalentPicks, name: 'Talent Pick Rates' },
    { id: StatsCategory.TalentWins, name: 'Talent Win Rates' },
    { id: StatsCategory.Items, name: 'Item Pick Rates' },
]

export const perChampionStatsCategories = [
    StatsCategory.ChampionCards,
    StatsCategory.TalentPicks,
    StatsCategory.TalentWins,
    StatsCategory.Items
]
