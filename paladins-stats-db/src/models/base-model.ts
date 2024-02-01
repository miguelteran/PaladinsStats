import { Document, ObjectId } from "mongodb";


export interface BaseModel extends Document {
    _id?: ObjectId;
}
