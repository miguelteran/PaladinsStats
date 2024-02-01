import { Collection, Document, Filter } from "mongodb";
import { BaseModel } from "../models/base-model";
import { CountFilter } from "../models/filter/count-filter";


export interface DAL {
    insertMany(entries: BaseModel[]): Promise<number>;
    aggregate<U extends Document>(pipeline: Document[]): Promise<U[]>;
    buildMatch(filter: CountFilter): Document;
    delete(filter: Filter<any>): Promise<void>;
}


export abstract class BaseDAL<T extends BaseModel> implements DAL {

    collection: Collection<T>;

    constructor(collection: Collection<T>) {
        this.collection = collection;
    }

    async insertMany(entries: T[]): Promise<number> {
        const result = await this.collection.insertMany(entries as any);
        if (result.insertedCount <= 0) {
            throw new Error('Did not insert entries');
        }
        return result.insertedCount;
    }

    async aggregate<U extends Document>(pipeline: Document[]): Promise<U[]> {
        const cursor = this.collection.aggregate<U>(pipeline);
        return await cursor.toArray();
    }

    abstract buildMatch(filter: CountFilter): Document;

    async delete(filter: Filter<T>) {
        const result = await this.collection.deleteMany(filter);
        console.debug('%s: Deleted %d entries', this.constructor.name, result.deletedCount);
    }
}
