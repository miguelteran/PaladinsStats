import { Document } from "mongodb";


export interface CountResult extends Document {
    id?: number;
    champion?: string;
    talent?: string;
    card?: string;
    item?: string;
    count: number;
}
