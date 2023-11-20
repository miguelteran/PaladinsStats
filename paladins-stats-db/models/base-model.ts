import { Document, ObjectId } from "mongodb";


export interface BaseModel {
    id?: ObjectId;
}
