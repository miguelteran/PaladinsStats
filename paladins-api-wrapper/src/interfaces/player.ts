export interface Player {
    ActivePlayerId: number;
    AvatarId: number;
    AvatarURL: string;
    Created_Datetime: string;
    HoursPlayed: number;
    Id: number;
    Last_Login_Datetime: string;
    Leaves: number;
    Level: number;
    LoadingFrame: string;
    Losses: number;
    MasteryLevel: number;
    MergedPlayers: null | any;
    MinutesPlayed: number;
    Name: string;
    Personal_Status_Message: string;
    Platform: string;
    RankedConquest: RankedStats;
    RankedController: RankedStats;
    RankedKBM: RankedStats;
    Region: string;
    TeamId: number;
    Team_Name: string;
    Tier_Conquest: number;
    Tier_RankedController: number;
    Tier_RankedKBM: number;
    Title: string;
    Total_Achievements: number;
    Total_Worshippers: number;
    Total_XP: number;
    Wins: number;
    hz_gamer_tag: null | any;
    hz_player_name: string;
    privacy_flag: string;
    ret_msg: null | string; 
}

export interface RankedStats {
    Leaves: number;
    Losses: number;
    Name: string;
    Points: number;
    PrevRank: number;
    Rank: number;
    Season: number;
    Tier: number;
    Trend: number;
    Wins: number;
    player_id: null | any; 
    ret_msg: null | any;
}

export interface PlayerSearchResult {
    Name: string;
    hz_player_name: null | string;
    player_id: string;
    portal_id: string;
    privacy_flag: string;
    ret_msg: null | string;
}
