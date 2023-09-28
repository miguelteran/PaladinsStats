export interface ChampionStats {
    Assists: number;
    Deaths: number;
    Gold: number;
    Kills: number;
    LastPlayed: string;
    Losses: number;
    MinionKills: number;
    Minutes: number;
    Rank: number;
    Wins: number;
    Worshippers: number;
    champion: string;
    champion_id: string;
    player_id: string;
    ret_msg: null | string;
}

export interface ChampionStatsByQueue {
    Assists: number;
    Champion: string;
    ChampionId: number;
    Deaths: number;
    Gold: number;
    Kills: number;
    LastPlayed: string;
    Losses: number;
    Match_Queue_Id: number;
    Matches: number;
    Minutes: number;
    Queue: string;
    Wins: number;
    player_id: string;
    ret_msg: null | string;
}
