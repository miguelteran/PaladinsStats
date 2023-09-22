const moment = require('moment');
import { createHash } from 'crypto';
import * as dotenv from "dotenv";


dotenv.config();


const PALADINS_API_URL = 'https://api.paladins.com/paladinsapi.svc';
const RESPONSE_FORMAT = 'json';
const ENGLISH_LANGUAGE_CODE = 1;
const INVALID_SESSION_ID_MESSAGE = 'Invalid session id.';
enum PALADINS_API_METHODS {
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


type numberOrString = number | string;

export interface Logger {
    info(...data: any[]): void;
    warn(...data: any[]): void;
    error(...data: any[]): void;
    debug(...data: any[]): void;
}

let _logger: Logger = console;
let _sessionId: string = "";

export function setLogger(logger: Logger): void {
    _logger = logger;
}

export function setSessionId(sessionId: string): void {
    _sessionId = sessionId;
}

function getCurrentUTCTimestamp() {
    return moment().utc().format('yyyyMMDDHHmmss');
}

function generateSignature(method: PALADINS_API_METHODS, timestamp: string) {
    const value: string = process.env.DEV_ID + method + process.env.AUTH_KEY + timestamp;
    return createHash('md5').update(value).digest('hex');
}

function csvJoin(values: numberOrString[]) {
    return values.join(',');
}

async function get(url: string) {
    const options = { 
        method: 'GET',
        headers: {
            Accept: 'application/json',
        }
    };
    const response = await fetch(url, options);
    if (!response.ok) {
       _logger.error(`Error status: ${response.status}`);
       return undefined;
    }
    return await response.json()
}

async function getRequestToPaladinsApi(method: PALADINS_API_METHODS, ...additionalParams: numberOrString[]): Promise<any> {
    return await getRequestToPaladinsApiWithRetry(method, true, ...additionalParams);
}

async function getRequestToPaladinsApiWithRetry(method: PALADINS_API_METHODS, retry: boolean, ...additionalParams: numberOrString[]): Promise<any> {
    if (!_sessionId) {
        _sessionId = await createSession();
    }
    
    const timestamp = getCurrentUTCTimestamp(); 
    const signature = generateSignature(method, timestamp);
    const params = additionalParams.length > 0 ? '/' + additionalParams.join('/') : '';
    const url = `${PALADINS_API_URL}/${method}${RESPONSE_FORMAT}/${process.env.DEV_ID}/${signature}/${_sessionId}/${timestamp}${params}`;
    const response = await get(url);
    
    if (response && response.length > 0 && response[0].ret_msg === INVALID_SESSION_ID_MESSAGE) {
        _logger.debug('Invalid session');
        if (retry) {
            _sessionId = '';
            return await getRequestToPaladinsApiWithRetry(method, false, ...additionalParams);
        }
    } else {
        return response;
    }
}

export async function createSession() {
    _logger.debug('Creating new session');
    const timestamp = getCurrentUTCTimestamp();
    const signature = generateSignature(PALADINS_API_METHODS.CREATE_SESSION_METHOD, timestamp);
    const url = `${PALADINS_API_URL}/${PALADINS_API_METHODS.CREATE_SESSION_METHOD}${RESPONSE_FORMAT}/${process.env.DEV_ID}/${signature}/${timestamp}`;
    const response = await get(url);
    if (response) {
        return response.session_id;
    } else {
        throw new Error('Could not create a new session');
    }
}

export async function testSession() {
    _logger.debug('Testing session');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.TEST_SESSION);
}

export async function getDataUsed() {
    _logger.debug('Checking data used');
    const data = await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_DATA_USED);
    return data ? data[0] : undefined;
}

export async function getHirezServerStatus() {
    _logger.debug('Getting HiRez server status');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_HIREZ_SERVER_STATUS);
}

export async function getChampions() {
    _logger.debug('Getting champions');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPIONS, ENGLISH_LANGUAGE_CODE);
}

export async function getChampionCards(championId: number) {
    _logger.debug('Getting champion cards for champion ' + championId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_CARDS, championId, ENGLISH_LANGUAGE_CODE);
}

export async function getChampionSkins(championId: number) {
    _logger.debug('Getting champion skins for champion ' + championId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_SKINS, championId, ENGLISH_LANGUAGE_CODE);
}

export async function getAllChampionSkins() {
    _logger.debug('Getting all champion skins for champion');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_SKINS, -1, ENGLISH_LANGUAGE_CODE);
}

export async function getItems() {
    _logger.debug('Getting items');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_ITEMS, ENGLISH_LANGUAGE_CODE);
}

export async function getBountyItems() {
    _logger.debug('Getting bounty items');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_BOUNTY_ITEMS);
}

export async function getPlayer(playerId: numberOrString) {
    _logger.debug('Getting info for player ' + playerId);
    const player = await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER, playerId);
    return player ? player[0] : undefined;
}

export async function getPlayerBatch(playerIds: numberOrString[]) {
    _logger.debug('Getting info for players ' + playerIds);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER_BATCH, csvJoin(playerIds));
}

export async function getChampionRanks(playerId: numberOrString) {
    _logger.debug('Getting champion ranks for player ' + playerId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_RANKS, playerId);
}

export async function getPlayerLoadouts(playerId: numberOrString) {
    _logger.debug('Getting loadouts for player ' + playerId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER_LOADOUTS, playerId, ENGLISH_LANGUAGE_CODE);
}

export async function getMatchHistory(playerId: numberOrString) {
    _logger.debug('Getting match history for player ' + playerId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_HISTORY, playerId);
}

export async function getQueueStats(playerId: numberOrString, queueId: number) {
    _logger.debug('Getting stats for player ' + playerId + ' and queue ' + queueId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_QUEUE_STATS, playerId, queueId);
}

export async function getQueueStatsBatch(playerId: numberOrString, queueIds: number[]) {
    _logger.debug('Getting batch stats for player ' + playerId + ' and queues ' + queueIds);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_QUEUE_STATS_BATCH, playerId, csvJoin(queueIds));
}

export async function searchPlayers(playerName: string) {
    _logger.debug('Searching players with name ' + playerName);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.SEARCH_PLAYERS, playerName);
}

export async function getMatchDetails(matchId: numberOrString) {
    _logger.debug('Getting details for match ' + matchId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_DETAILS, matchId);
}

export async function getMatchDetailsBatch(matchIds: numberOrString[]) {
    _logger.debug('Getting details for matches ' + matchIds);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_DETAILS_BATCH, csvJoin(matchIds));
}

export async function getMatchIdsByQueue(queueId: number, date: string, hour: string) {
    _logger.debug('Getting matchs for queue ' + queueId + ' with date ' + date + ' and hour ' + hour);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_IDS_BY_QUEUE, queueId, date, hour);
}