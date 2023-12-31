export enum StatsCategory {
    ChampionPicks = 0,
    ChampionWins,
    ChampionBans,
    TalentPicks,
    TalentWins
}

export const statsCategories = [
    { id: StatsCategory.ChampionPicks, name: 'Champion Pick Rates' },
    { id: StatsCategory.ChampionWins, name: 'Champion Win Rates' },
    { id: StatsCategory.ChampionBans, name: 'Champion Ban Rates' },
    { id: StatsCategory.TalentPicks, name: 'Talent Pick Rates' },
    { id: StatsCategory.TalentWins, name: 'Talent Pick Rates' },
]
