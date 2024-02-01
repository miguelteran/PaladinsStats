import { AggregationPipelineBuilder } from "../database/aggregation-pipeline-builder";
import { PaladinsStatsCollections, PaladinsStatsDatabase, getPaladinsStatsDatabaseConnection } from "../database/paladins-stats-db";
import { ChampionMatch } from "../models/champion-match";


const BYTES_TO_MEGABTES = 1024 * 1024;
const MAX_DB_SIZE_MB = 480;

async function main() {
    const db = await getPaladinsStatsDatabaseConnection();
    const dbStats = await db.database.stats({scale: BYTES_TO_MEGABTES});
    const dbSize = dbStats.dataSize;
    console.log('Database size is %d MB', dbSize);
    if (dbStats.dataSize >= MAX_DB_SIZE_MB) {
        console.log('Performing cleanup...');
        await deleteOldestEntries(db);
    } else {
        console.log('Nothing to do');
    }
    process.exit(0);
}

async function deleteOldestEntries(db: PaladinsStatsDatabase) {
    const championMatchesDAL = db.getDal(PaladinsStatsCollections.CHAMPION_MATCHES);
    const championBansDAL = db.getDal(PaladinsStatsCollections.CHAMPION_BANS);

    const pipeline = new AggregationPipelineBuilder().sort({matchTimestamp: 1}).limit(1).build();
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
