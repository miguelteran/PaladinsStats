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


async function main() {

    const paladinsStatsDB = await getPaladinsStatsDatabaseConnection();

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const date = `${yesterday.getFullYear()}${yesterday.getMonth()}${yesterday.getDate()}`;
    console.log(`Getting ranked matches from ${date}`);

    for (let hour = 0; hour < NUMBER_OF_HOURS_PER_DAY; hour++) {
        for (let minutes = 0; minutes < NUMBER_OF_MINUTES_PER_HOUR; minutes += 10) {
            const time = `${hour},${minutes === 0 ? '00' : minutes}`;
            await getRankedMatches(paladinsStatsDB, date, time);
        }
    }
}


async function getRankedMatches(paladinsStatsDB: PaladinsStatsDatabase, date: string, time: string) {

    const championMatchesDAL = paladinsStatsDB.getDal(PaladinsStatsCollections.CHAMPION_MATCHES) as ChampionMatchesDAL;
    const championBansDAL = paladinsStatsDB.getDal(PaladinsStatsCollections.CHAMPION_BANS) as ChampionBansDAL;

    const matchSummaries = await getMatchIdsByQueue(RANKED_QUEUE, date, time);
    const batches = Math.ceil(matchSummaries.length / BATCH_SIZE);
    
    for (let i=0; i<batches; i++) {
        const start = i * BATCH_SIZE;
        const end = start + BATCH_SIZE;
        const matchIds: string[] = matchSummaries.slice(start, end).map(match => match.Match);
        const matchDetailsList = await getMatchDetailsBatch(matchIds);

        // Go through each match

        for (let matchDetails of matchDetailsList) {
            
            // Common match information

            const ranks = matchDetails.playerMatchDetails.map(details => details.League_Tier);
            const platforms = matchDetails.playerMatchDetails.map(details => details.Platform);
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

            await championMatchesDAL.insertMany(championMatches);
            await championBansDAL.insertMany(championBans);
        }
    }
}


main();
