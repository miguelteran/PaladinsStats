export interface Loadout {
    ChampionId: number;
    ChampionName: string;
    DeckId: number;
    DeckName: string;
    LoadoutItems: LoadoutItem[];
    playerId: number;
    playerName: string;
    ret_msg: null | string;
}

export interface LoadoutItem {
    ItemId: number;
    ItemName: string;
    Points: number;
}

export interface ChampionCard {
    active_flag_activation_schedule: string;
    active_flag_lti: string;
    card_description: string;
    card_id1: number;
    card_id2: number; // LoadoutItem.ItemId
    card_name: string;
    card_name_english: string;
    championCard_URL: string;
    championIcon_URL: string;
    championTalent_URL: null | string;
    champion_id: number;
    champion_name: string;
    exclusive: string;
    rank: number;
    rarity: string;
    recharge_seconds: number;
    ret_msg: null | string;
}
