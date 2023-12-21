import { Collection, Document } from "mongodb";
import { BaseModel } from "../models/base-model";


export interface DAL {
    insertMany(entries: BaseModel[]): void;
    aggregate<U extends Document>(pipeline: Document[]): Promise<U[]>;
}


export class BaseDAL<T extends BaseModel> implements DAL {

    collection: Collection<T>;

    constructor(collection: Collection<T>) {
        this.collection = collection;
    }

    async insertMany(entries: T[]) {
        const result = await this.collection.insertMany(entries as any);
        if (result.insertedCount <= 0) {
            throw new Error('Did not insert entries');
        }
    }

    async aggregate<U extends Document>(pipeline: Document[]): Promise<U[]> {
        const cursor = this.collection.aggregate<U>(pipeline);
        return await cursor.toArray();
    }
}
