import { BaseAggregationResult } from "./base-aggregation-result";

export interface ChampionsAggregrationResult extends BaseAggregationResult {
    championId: number;
    championName: string;
}
