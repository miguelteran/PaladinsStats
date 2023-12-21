import { Document } from "mongodb";


export interface MatchCount extends Document {
    id?: number;
    name?: string;
    count: number;
}
