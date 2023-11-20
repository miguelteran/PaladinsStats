import { Collection } from "mongodb";
import { ChampionBan } from "../models/champion-ban";
import { BaseDAL } from "./base-dal";


export class ChampionBansDAL extends BaseDAL<ChampionBan> {

    constructor(collection: Collection<ChampionBan>) {
        super(collection);
    }
}
