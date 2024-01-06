export enum StatsCategory {
    ChampionPicks = 0,
    ChampionWins,
    ChampionBans,
    ChampionCards,
    TalentPicks,
    TalentWins
}

export const statsCategories = [
    { id: StatsCategory.ChampionPicks, name: 'Champion Pick Rates' },
    { id: StatsCategory.ChampionWins, name: 'Champion Win Rates' },
    { id: StatsCategory.ChampionBans, name: 'Champion Ban Rates' },
    { id: StatsCategory.ChampionCards, name: 'Champion Cards Pick Rates' },
    { id: StatsCategory.TalentPicks, name: 'Talent Pick Rates' },
    { id: StatsCategory.TalentWins, name: 'Talent Pick Rates' },
]

export const itemsStatsCategories = [
    StatsCategory.ChampionCards,
    StatsCategory.TalentPicks,
    StatsCategory.TalentWins
]
