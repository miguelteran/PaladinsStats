import { Document } from "mongodb";


export class AggregationPipelineBuilder {

    private _pipeline: Document[];
    private _group?: Document;

    constructor() {
        this._pipeline = [];
    }

    match(match: Document) {
        this._pipeline.push({'$match': match});
        return this;
    }

    group(group: Document) {
        this._pipeline.push({'$group': {'_id': group}});
        this._group = group;
        return this;
    }

    groupedCount(group: Document) {
        this._pipeline.push({
            '$group': {
              '_id': group, 
              'count': {'$count': {}}
            }
        });
        this._group = group;
        return this;
    }

    count() {
        this._pipeline.push({'$count': 'count'});
        return this;
    }

    project(projection: Document) {
        this._pipeline.push({'$project': projection});
        return this;
    }

    projectIdFieldsOnRootLevel() {
        if (this._group) {
            const projection: Document = {};
            projection['_id'] = 0;
            projection['count'] = 1;
            Object.keys(this._group).forEach(k => projection[k] = `$_id.${k}`)
            this.project(projection);
        }
        return this;
    }

    unwind(unwindPath: string) {
        this._pipeline.push({'$unwind': {'path': unwindPath}});
        return this;
    }

    sort(sort: Document) {
        this._pipeline.push({'$sort': sort});
        return this;
    }

    limit(count: number) {
        this._pipeline.push({'$limit': count});
        return this;
    }

    build() {
        return this._pipeline;
    }
}
