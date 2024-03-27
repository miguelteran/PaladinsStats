import { ChampionsAggregrationResult } from "./champions-aggregation-result";

export interface CardsAggregrationResult extends ChampionsAggregrationResult {
    carId: number;
    cardName: string;
}
