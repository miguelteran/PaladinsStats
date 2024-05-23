import { AggregationPipelineBuilder } from "../database/aggregation-pipeline-builder";
import { PaladinsStatsCollections, PaladinsStatsDatabase, getPaladinsStatsDatabaseConnection } from "../database/paladins-stats-db";
import { ChampionMatch } from "../models/champion-match";


const BYTES_TO_MEGABTES = 1024 * 1024;
const MAX_DB_SIZE_MB = 490;

async function main() {
    const db = await getPaladinsStatsDatabaseConnection();
    while (await getDatabaseSize(db) >= MAX_DB_SIZE_MB) {
        await deleteOldestEntries(db);
    }
    console.log('Database is now below threshold');
    process.exit(0);
}

async function getDatabaseSize(db: PaladinsStatsDatabase) {
    console.log('Getting database stats...');
    const dbStats = await db.database.stats({scale: BYTES_TO_MEGABTES});
    const totalSize = dbStats.dataSize + dbStats.indexSize;
    console.log('Database size: %d MB', dbStats.dataSize);
    console.log('Index size: %d MB', dbStats.indexSize);
    console.log('Total size: %d MB', totalSize);
    return totalSize;
}

async function deleteOldestEntries(db: PaladinsStatsDatabase) {
    console.log('Performing cleanup...');
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);
    const championBansDAL = db.getDal(PaladinsStatsCollections.CHAMPION_BANS);
    const pipeline = new AggregationPipelineBuilder().sort({matchId: 1}).limit(1).build();
    const championMatch = await championMatchesDAL.aggregate<ChampionMatch>(pipeline);

    if (championMatch) {
        const timestamp = championMatch[0].matchTimestamp;
        const date = timestamp.split(' ')[0];
        console.log('Deleting entries with date', date);
        const deleteFilter = { matchTimestamp: {'$regex': date} };
        await championMatchesDAL.delete(deleteFilter);
        await championBansDAL.delete(deleteFilter);
    }
}

main();
