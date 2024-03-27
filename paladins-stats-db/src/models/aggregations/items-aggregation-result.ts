import { BaseAggregationResult } from "./base-aggregation-result";

export interface ItemsAggregrationResult extends BaseAggregationResult {
    itemId: number;
    itemName: string;
}
