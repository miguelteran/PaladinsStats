export const PALADINS_API_URL = 'https://api.paladins.com/paladinsapi.svc';
export const RESPONSE_FORMAT = 'json';
export const ENGLISH_LANGUAGE_CODE = 1;
export const INVALID_SESSION_ID_MESSAGE = 'Invalid session id.';
export const NUMBER_OF_BANS = 8;
export const NUMBER_OF_PLAYERS_IN_MATCH = 10;

export enum PALADINS_API_METHODS {
    CREATE_SESSION_METHOD = 'createsession',
    TEST_SESSION = 'testsession',
    GET_DATA_USED = 'getdataused',
    GET_HIREZ_SERVER_STATUS = 'gethirezserverstatus',
    GET_CHAMPIONS = 'getchampions',
    GET_CHAMPION_CARDS = 'getchampioncards',
    GET_CHAMPION_SKINS = 'getchampionskins',
    GET_ITEMS = 'getitems',
    GET_BOUNTY_ITEMS = 'getbountyitems',
    GET_PLAYER = 'getplayer',
    GET_PLAYER_BATCH = 'getplayerbatch',
    GET_CHAMPION_RANKS = 'getchampionranks',
    GET_PLAYER_LOADOUTS = 'getplayerloadouts',
    GET_MATCH_HISTORY = 'getmatchhistory',
    GET_QUEUE_STATS = 'getqueuestats',
    GET_QUEUE_STATS_BATCH = 'getqueuestatsbatch',
    SEARCH_PLAYERS = 'searchplayers',
    GET_MATCH_DETAILS = 'getmatchdetails',
    GET_MATCH_DETAILS_BATCH = 'getmatchdetailsbatch',
    GET_MATCH_IDS_BY_QUEUE = 'getmatchidsbyqueue',
}
