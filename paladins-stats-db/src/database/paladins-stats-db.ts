import * as dotenv from 'dotenv';
import { MongoClient, Db } from 'mongodb';
import { DAL } from '../dal/base-dal';
import { ChampionMatchesDAL } from '../dal/champion-matches-dal';
import { ChampionBansDAL } from '../dal/champion-bans-dal';

dotenv.config();

const PALADINS_STATS_DB_URI = process.env.PALADINS_STATS_DB_URI;
const PALADINS_STATS_DB_NAME = process.env.PALADINS_STATS_DB_NAME;


export enum PaladinsStatsCollections {
    CHAMPION_MATCHES = 'champion-matches',
    CHAMPION_BANS = 'champion-bans'
}


export class PaladinsStatsDatabase {

    database: Db;
    dals!: Map<PaladinsStatsCollections, DAL>;

    constructor(database: Db) {
        this.database = database;
        this.dals = new Map;
    }
    
    private initializeDal(collectionEnum: PaladinsStatsCollections): DAL {
        switch(collectionEnum) {
            case PaladinsStatsCollections.CHAMPION_MATCHES:
                return new ChampionMatchesDAL(this.database.collection(collectionEnum.valueOf()));
            case PaladinsStatsCollections.CHAMPION_BANS:
                return new ChampionBansDAL(this.database.collection(collectionEnum.valueOf()));
            default:
                throw new Error('Invalid collection ' + collectionEnum);  
        }
    }

    getDal(collectionEnum: PaladinsStatsCollections): DAL {
        if (!this.dals.has(collectionEnum)) {
            this.dals.set(collectionEnum, this.initializeDal(collectionEnum));
        }
        return this.dals.get(collectionEnum)!!;
    }
}


export async function getPaladinsStatsDatabaseConnection(): Promise<PaladinsStatsDatabase> {
    if (!PALADINS_STATS_DB_URI || !PALADINS_STATS_DB_NAME) {
        throw new Error('Please set up db env variables');
    }

    console.log(`Setting up connection to '${PALADINS_STATS_DB_NAME}' database`)
    const client = new MongoClient(PALADINS_STATS_DB_URI, { connectTimeoutMS: 10000 });
    await client.connect();
    return new PaladinsStatsDatabase(client.db(PALADINS_STATS_DB_NAME));
}
