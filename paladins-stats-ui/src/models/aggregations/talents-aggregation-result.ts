import { ChampionsAggregrationResult } from "./champions-aggregation-result";


export interface TalentsAggregrationResult extends ChampionsAggregrationResult {
    talentId: number;
    talentName: string;
}
