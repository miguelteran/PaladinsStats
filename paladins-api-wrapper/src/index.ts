const moment = require('moment');
import { createHash } from 'crypto';
import * as dotenv from "dotenv";


dotenv.config();


const PALADINS_API_URL = 'https://api.paladins.com/paladinsapi.svc';
const RESPONSE_FORMAT = 'json';
const ENGLISH_LANGUAGE_CODE = 1;
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

async function getRequestToPaladinsApi(method: PALADINS_API_METHODS, ...additionalParams: numberOrString[]) {
    if (!_sessionId) {
        throw new Error('_sessionId has not been set');
    }
    const timestamp = getCurrentUTCTimestamp(); 
    const signature = generateSignature(method, timestamp);
    const params = additionalParams.length > 0 ? '/' + additionalParams.join('/') : '';
    const url = `${PALADINS_API_URL}/${method}${RESPONSE_FORMAT}/${process.env.DEV_ID}/${signature}/${_sessionId}/${timestamp}${params}`;
    return await get(url);
}

export async function createSession() {
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
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.TEST_SESSION);
}

export async function getDataUsed() {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_DATA_USED);
}

export async function getHirezServerStatus() {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_HIREZ_SERVER_STATUS);
}

export async function getChampions() {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPIONS, ENGLISH_LANGUAGE_CODE);
}

export async function getChampionCards(championId: number) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_CARDS, championId, ENGLISH_LANGUAGE_CODE);
}

export async function getChampionSkins(championId: number) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_SKINS, championId, ENGLISH_LANGUAGE_CODE);
}

export async function getAllChampionSkins() {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_SKINS, -1, ENGLISH_LANGUAGE_CODE);
}

export async function getItems() {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_ITEMS, ENGLISH_LANGUAGE_CODE);
}

export async function getBountyItems() {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_BOUNTY_ITEMS);
}

export async function getPlayer(playerId: numberOrString) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER, playerId);
}

export async function getPlayerBatch(playerIds: numberOrString[]) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER_BATCH, csvJoin(playerIds));
}

export async function getChampionRanks(playerId: numberOrString) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_RANKS, playerId);
}

export async function getPlayerLoadouts(playerId: numberOrString) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER_LOADOUTS, playerId, ENGLISH_LANGUAGE_CODE);
}

export async function getMatchHistory(playerId: numberOrString) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_HISTORY, playerId);
}

export async function getQueueStats(playerId: numberOrString, queueId: number) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_QUEUE_STATS, playerId, queueId);
}

export async function getQueueStatsBatch(playerId: numberOrString, queueIds: number[]) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_QUEUE_STATS_BATCH, playerId, csvJoin(queueIds));
}

export async function searchPlayers(playerName: string) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.SEARCH_PLAYERS, playerName);
}

export async function getMatchDetails(matchId: numberOrString) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_DETAILS, matchId);
}

export async function getMatchDetailsBatch(matchIds: numberOrString[]) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_DETAILS_BATCH, csvJoin(matchIds));
}

export async function getMatchIdsByQueue(queueId: number, date: string, hour: string) {
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_IDS_BY_QUEUE, queueId, date, hour);
}