import * as dotenv from "dotenv";
import moment from 'moment';
import { createHash } from 'crypto';
import { PALADINS_API_URL, RESPONSE_FORMAT, ENGLISH_LANGUAGE_CODE, INVALID_SESSION_ID_MESSAGE,
    PALADINS_API_METHODS, NUMBER_OF_BANS, NUMBER_OF_PLAYERS_IN_MATCH } from '../constants/constants';
import { Logger } from '../interfaces/logger';
import { Player, PlayerSearchResult } from '../interfaces/player';
import { ChampionCard, Loadout } from '../interfaces/loadout';
import { Item } from '../interfaces/item';
import { MatchSummary, RecentMatch, PlayerMatchDetails, MatchDetails } from '../interfaces/match';
import { Champion, ChampionBan } from '../interfaces/champion';
import { ChampionSkin } from '../interfaces/champion-skin';
import { ChampionStats, ChampionStatsByQueue } from '../interfaces/champion-stats';
import { ApiUsage } from '../interfaces/api-usage';
import { ServerStatus } from '../interfaces/server-status';
import { BountyItem } from '../interfaces/bounty-item';


dotenv.config();


type numberOrString = number | string;


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

function buildMatchDetailsObject(details: PlayerMatchDetails): MatchDetails {
    const championBans: ChampionBan[] = [];
    for (let i=1; i<=NUMBER_OF_BANS; i++) {
        championBans.push({
            id: Number(details[`BanId${i}`]),
            name: String(details[`Ban_${i}`]),
        });
    }

    return {
        matchId: details.Match,
        matchTimestamp: details.Entry_Datetime,
        matchDuration: details.Match_Duration,
        queueId: details.match_queue_id,
        region: details.Region,
        map: details.Map_Game,
        championBans: championBans,
        playerMatchDetails: []
    };
}

function logCorruptedMatch(matchId: numberOrString) {
    _logger.warn(`Match ${matchId} is corrupted`);
}


// #####################
// WRAPPER FUNCTIONS
// #####################

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

export async function testSession(): Promise<string> {
    _logger.debug('Testing session');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.TEST_SESSION);
}

export async function getDataUsed(): Promise<ApiUsage> {
    _logger.debug('Checking data used');
    const data = await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_DATA_USED);
    return data ? data[0] : undefined;
}

export async function getHirezServerStatus(): Promise<ServerStatus> {
    _logger.debug('Getting HiRez server status');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_HIREZ_SERVER_STATUS);
}

export async function getChampions(): Promise<Champion[]> {
    _logger.debug('Getting champions');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPIONS, ENGLISH_LANGUAGE_CODE);
}

export async function getChampionCards(championId: number): Promise<ChampionCard[]> {
    _logger.debug('Getting champion cards for champion ' + championId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_CARDS, championId, ENGLISH_LANGUAGE_CODE);
}

export async function getChampionSkins(championId: number): Promise<ChampionSkin[]> {
    _logger.debug('Getting champion skins for champion ' + championId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_SKINS, championId, ENGLISH_LANGUAGE_CODE);
}

export async function getAllChampionSkins(): Promise<ChampionSkin[]> {
    _logger.debug('Getting all champion skins for champion');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_SKINS, -1, ENGLISH_LANGUAGE_CODE);
}

export async function getItems(): Promise<Item[]> {
    _logger.debug('Getting items');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_ITEMS, ENGLISH_LANGUAGE_CODE);
}

export async function getBountyItems(): Promise<BountyItem[]> {
    _logger.debug('Getting bounty items');
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_BOUNTY_ITEMS);
}

export async function getPlayer(playerId: numberOrString): Promise<Player> {
    _logger.debug('Getting info for player ' + playerId);
    const player = await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER, playerId);
    return player && player[0];
}

export async function getPlayerBatch(playerIds: numberOrString[]): Promise<Player[]> {
    _logger.debug('Getting info for players ' + playerIds);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER_BATCH, csvJoin(playerIds));
}

export async function getChampionRanks(playerId: numberOrString): Promise<ChampionStats[]> {
    _logger.debug('Getting champion ranks for player ' + playerId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_CHAMPION_RANKS, playerId);
}

export async function getPlayerLoadouts(playerId: numberOrString): Promise<Loadout[]> {
    _logger.debug('Getting loadouts for player ' + playerId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_PLAYER_LOADOUTS, playerId, ENGLISH_LANGUAGE_CODE);
}

export async function getMatchHistory(playerId: numberOrString): Promise<RecentMatch[]> {
    _logger.debug('Getting match history for player ' + playerId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_HISTORY, playerId);
}

export async function getQueueStats(playerId: numberOrString, queueId: number): Promise<ChampionStatsByQueue[]> {
    _logger.debug('Getting champion stats for player ' + playerId + ' and queue ' + queueId);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_QUEUE_STATS, playerId, queueId);
}

export async function getQueueStatsBatch(playerId: numberOrString, queueIds: number[]): Promise<ChampionStatsByQueue[]> {
    _logger.debug('Getting batch stats for player ' + playerId + ' and queues ' + queueIds);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_QUEUE_STATS_BATCH, playerId, csvJoin(queueIds));
}

export async function searchPlayers(playerName: string): Promise<PlayerSearchResult[]> {
    _logger.debug('Searching players with name ' + playerName);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.SEARCH_PLAYERS, playerName);
}

export async function getMatchDetails(matchId: numberOrString): Promise<MatchDetails|undefined> {
    _logger.debug('Getting details for match ' + matchId);
    const playerMatchDetails: PlayerMatchDetails[] = await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_DETAILS, matchId);
    if (playerMatchDetails.length === 0) {
        _logger.warn(`Match ${matchId} not found`);
        return undefined;
    }
    if (playerMatchDetails.length < NUMBER_OF_PLAYERS_IN_MATCH || playerMatchDetails.findIndex(d => d.ret_msg !== null) !== -1) {
        logCorruptedMatch(matchId);
        return undefined;
    }
    const matchDetails = buildMatchDetailsObject(playerMatchDetails[0]);
    matchDetails.playerMatchDetails = playerMatchDetails;
    return matchDetails;
}

export async function getMatchDetailsBatch(matchIds: numberOrString[]): Promise<MatchDetails[]> {
    _logger.debug('Getting details for matches ' + matchIds);
    const playerMatchDetails: PlayerMatchDetails[] = await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_DETAILS_BATCH, csvJoin(matchIds));
    const matchDetailsMap: Map<number, MatchDetails> = new Map;
    playerMatchDetails.forEach(details => {
        const matchId = details.Match;
        if (matchId !== 0 && details.ret_msg === null) {
            if (!matchDetailsMap.has(matchId)) {
                matchDetailsMap.set(matchId, buildMatchDetailsObject(details));
             }
             matchDetailsMap.get(matchId)?.playerMatchDetails.push(details);
        }
    });
    return Array.from(matchDetailsMap.values()).filter(details => {
        if (details.playerMatchDetails.length !== NUMBER_OF_PLAYERS_IN_MATCH) {
            logCorruptedMatch(details.matchId);
            return false;
        }
        return true;
    });
}

export async function getMatchIdsByQueue(queueId: number, date: string, hour: string): Promise<MatchSummary[]> {
    _logger.debug('Getting matchs for queue ' + queueId + ' with date ' + date + ' and hour ' + hour);
    return await getRequestToPaladinsApi(PALADINS_API_METHODS.GET_MATCH_IDS_BY_QUEUE, queueId, date, hour);
}