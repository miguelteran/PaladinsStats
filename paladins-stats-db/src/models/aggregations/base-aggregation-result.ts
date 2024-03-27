import { Document } from "mongodb";


export interface BaseAggregationResult extends Document {
    [key: string]: string|number;
    count: number;
}
