import { Collection, Document } from "mongodb";
import { BaseModel } from "../models/base-model";
import { CountFilter } from "../models/filter/count-filter";


export interface DAL {
    insertMany(entries: BaseModel[]): void;
    aggregate<U extends Document>(pipeline: Document[]): Promise<U[]>;
    buildMatch(filter: CountFilter): Document;
}


export abstract class BaseDAL<T extends BaseModel> implements DAL {

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

    abstract buildMatch(filter: CountFilter): Document;
}
