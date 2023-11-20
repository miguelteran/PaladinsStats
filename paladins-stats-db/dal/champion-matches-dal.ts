import { Collection } from "mongodb";
import { ChampionMatch } from "../models/champion-match";
import { BaseDAL } from "./base-dal";


export class ChampionMatchesDAL extends BaseDAL<ChampionMatch> {

    constructor(collection: Collection<ChampionMatch>) {
        super(collection);
    }
}
