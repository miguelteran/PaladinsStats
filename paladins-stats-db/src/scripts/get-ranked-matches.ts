import { getMatchIdsByQueue, getMatchDetailsBatch } from '@miguelteran/paladins-api-wrapper';
import { ChampionBan } from '../models/champion-ban';
import { ChampionMatch, LeveledItem, MatchResult } from '../models/champion-match';
import { PaladinsStatsCollections, PaladinsStatsDatabase, getPaladinsStatsDatabaseConnection } from '../database/paladins-stats-db';
import { ChampionMatchesDAL } from '../dal/champion-matches-dal';
import { ChampionBansDAL } from '../dal/champion-bans-dal';


const RANKED_QUEUE = 486;
const BATCH_SIZE = 10;
const NUMBER_OF_ITEMS = 4;
const NUMBER_OF_CARDS = 5;
const NUMBER_OF_HOURS_PER_DAY = 24;
const NUMBER_OF_MINUTES_PER_HOUR = 60;

let insertedChampionMatches = 0;
let insertedChampionBans = 0;


function formatNumber(n: number) {
    return n < 10 ? '0' + n : n;
}

function printUsage() {
    console.log('Usage:');
    console.log('node get-ranked-matches.js');
    console.log('node get-ranked-matches.js -d YYYYMMDD -t hh,mm');
}

function getScriptParameter(paramFlag: string, errorMessage: string) {
    const paramIndex = process.argv.indexOf(paramFlag);
    if (paramIndex === -1) {
        console.error(errorMessage);
        printUsage();
        process.exit(1);
    }
    return process.argv[paramIndex + 1];
}

async function main() {
    const numArgs = process.argv.length;
    if (numArgs === 2) {
        await getRankedMatchesFromYesterday();
        process.exit(0);
    } else if (numArgs === 6) {
        const date = getScriptParameter('-d', 'Date must be provided');
        const time = getScriptParameter('-t', 'Time must be provided');
        console.log('Getting ranked matches with date %s and time %s', date, time);
        const paladinsStatsDB = await getPaladinsStatsDatabaseConnection();
        await getRankedMatches(paladinsStatsDB, date, time);
        process.exit(0);
    } else {
        printUsage();
        process.exit(1);
    }
}

async function getRankedMatchesFromYesterday() {
    const paladinsStatsDB = await getPaladinsStatsDatabaseConnection();
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const month = formatNumber(yesterday.getMonth() + 1);
    const day = formatNumber(yesterday.getDate());
    const date = `${yesterday.getFullYear()}${month}${day}`;
    console.log(`Getting ranked matches from ${date}`);

    for (let hour = 0; hour < NUMBER_OF_HOURS_PER_DAY; hour++) {
        for (let minutes = 0; minutes < NUMBER_OF_MINUTES_PER_HOUR; minutes += 10) {
            const time = `${hour},${minutes === 0 ? '00' : minutes}`;
            await getRankedMatches(paladinsStatsDB, date, time);
        }
    }

    console.log('Inserted %d entries to champion-matches', insertedChampionMatches);
    console.log('Inserted %d entries to champion-bans', insertedChampionBans);
}


async function getRankedMatches(paladinsStatsDB: PaladinsStatsDatabase, date: string, time: string) {

    const championMatchesDAL = paladinsStatsDB.getDal(PaladinsStatsCollections.CHAMPION_MATCHES) as ChampionMatchesDAL;
    const championBansDAL = paladinsStatsDB.getDal(PaladinsStatsCollections.CHAMPION_BANS) as ChampionBansDAL;

    let matchSummaries;
    
    try {
        matchSummaries = await getMatchIdsByQueue(RANKED_QUEUE, date, time);
    } catch(e) {
        console.log('An error occurred while getting match ids', e);
        return;
    }
    
    const batches = Math.ceil(matchSummaries.length / BATCH_SIZE);
    
    for (let i=0; i<batches; i++) {
        
        const start = i * BATCH_SIZE;
        const end = start + BATCH_SIZE;
        const matchIds: string[] = matchSummaries.slice(start, end).map(match => match.Match);

        let matchDetailsList;
        
        try {
            matchDetailsList = await getMatchDetailsBatch(matchIds);
        } catch(e) {
            console.log('An error occurred while getting match details', e);
            continue;
        }

        // Go through each match

        for (let matchDetails of matchDetailsList) {

            try {

                // Common match information

                const ranks = [...new Set(matchDetails.playerMatchDetails.map(details => details.League_Tier))];
                const platforms = [...new Set(matchDetails.playerMatchDetails.map(details => details.Platform))];
                const championBans: ChampionBan[] = [];

                matchDetails.championBans.forEach(ban => {
                    championBans.push({
                        championId: ban.id,
                        championName: ban.name,
                        matchId: matchDetails.matchId,
                        matchTimestamp: matchDetails.matchTimestamp,
                        region: matchDetails.region,
                        map: matchDetails.map,
                        ranks: ranks,
                        platforms: platforms
                    });
                })

                // Information from each player

                const championMatches: ChampionMatch[] = [];

                for (let playerDetails of matchDetails.playerMatchDetails) {      
                    
                    const cards: LeveledItem[] = [];
                    for (let i=1; i<=NUMBER_OF_CARDS; i++) {
                        cards.push({
                            id: Number(playerDetails[`ItemId${i}`]),
                            name: String(playerDetails[`Item_Purch_${i}`]),
                            level: Number(playerDetails[`ItemLevel${i}`])
                        });
                    }

                    const items: LeveledItem[] = [];
                    for (let i=1; i<=NUMBER_OF_ITEMS; i++) {
                        items.push({
                            id: Number(playerDetails[`ActiveId${i}`]),
                            name: String(playerDetails[`Item_Active_${i}`]),
                            level: Number(playerDetails[`ActiveLevel${i}`])
                        })
                    }
                    
                    championMatches.push({
                        championId: playerDetails.ChampionId,
                        championName: playerDetails.Reference_Name,
                        matchId: playerDetails.Match,
                        matchTimestamp: playerDetails.Entry_Datetime,
                        matchResult: playerDetails.Win_Status as MatchResult,
                        region: playerDetails.Region,
                        map: playerDetails.Map_Game,
                        rank: playerDetails.League_Tier,
                        platform: playerDetails.Platform,
                        talent: { id: playerDetails.ItemId6, name: playerDetails.Item_Purch_6 },
                        cards: cards,
                        items: items
                    });
                }

                // Save entries

                insertedChampionMatches += await championMatchesDAL.insertMany(championMatches);
                insertedChampionBans += await championBansDAL.insertMany(championBans);
                
            } catch(e) {
                console.log('An error occurred while saving match details', e);
            }
        }
    }
}


main();
