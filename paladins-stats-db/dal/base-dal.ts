import { Collection } from "mongodb";
import { BaseModel } from "../models/base-model";


export interface DAL {
    insertMany(entries: BaseModel[]): void;
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
}
