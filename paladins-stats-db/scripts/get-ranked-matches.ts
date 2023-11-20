import { getMatchIdsByQueue, getMatchDetailsBatch } from '@miguelteran/paladins-api-wrapper';
import { ChampionBan } from '../models/champion-ban';
import { ChampionMatch, LeveledItem, MatchResult } from '../models/champion-match';
import { PaladinsStatsCollections, getPaladinsStatsDatabaseConnection } from '../database/paladins-stats-db';
import { ChampionMatchesDAL } from '../dal/champion-matches-dal';
import { ChampionBansDAL } from '../dal/champion-bans-dal';


const RANKED_QUEUE = 486;
const BATCH_SIZE = 10;
const NUMBER_OF_BANS = 8;
const NUMBER_OF_ITEMS = 4;
const NUMBER_OF_CARDS = 5;


async function main() {

    const paladinsStatsDB = await getPaladinsStatsDatabaseConnection();
    const championMatchesDAL = paladinsStatsDB.getDal(PaladinsStatsCollections.CHAMPION_MATCHES) as ChampionMatchesDAL;
    const championBansDAL = paladinsStatsDB.getDal(PaladinsStatsCollections.CHAMPION_BANS) as ChampionBansDAL;
    
    // date: poll up to the day before so we don't run into matches that are in progress
    const matchSummaries = await getMatchIdsByQueue(RANKED_QUEUE, '20231118', '0,00');
    const batches = Math.ceil(matchSummaries.length / BATCH_SIZE);
    
    for (let i=0; i<batches; i++) {
        const start = i * BATCH_SIZE;
        const end = start + BATCH_SIZE;
        const matchIds: string[] = matchSummaries.slice(start, end).map(match => match.Match);
        const matchDetails = await getMatchDetailsBatch(matchIds);

        // Go through each match

        for (let playerDetailsList of matchDetails.values()) {
            
            // Common match information

            const firstPlayer = playerDetailsList[0];
            const ranks = playerDetailsList.map(details => details.League_Tier);
            const platforms = playerDetailsList.map(details => details.Platform);
            const championBans: ChampionBan[] = [];

            for (let i=1; i<=NUMBER_OF_BANS; i++) {
                championBans.push({
                    championId: Number(firstPlayer[`BanId${i}`]),
                    championName: String(firstPlayer[`Ban_${i}`]),
                    matchId: firstPlayer.Match,
                    matchTimestamp: firstPlayer.Entry_Datetime,
                    region: firstPlayer.Region,
                    map: firstPlayer.Map_Game,
                    ranks: ranks,
                    platforms: platforms
                });
            }

            // Information from each player

            const championMatches: ChampionMatch[] = [];

            for (let playerDetails of playerDetailsList) {      
                
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
                })
            }

            // Save entries

            await championMatchesDAL.insertMany(championMatches);
            await championBansDAL.insertMany(championBans);
        }
    }
}


main();
