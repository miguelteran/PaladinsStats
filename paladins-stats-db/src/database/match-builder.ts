import { Document } from "mongodb";


export class MatchBuilder {

    private _match: Document;

    constructor() {
        this._match = {};
    }

    private getDocument(field: string) {
        if (!this._match[field]) {
            this._match[field] = {};
        }
        return this._match[field];
    }

    eq(field: string, value: string|number) {
        this._match[field] = value;
        return this;
    }

    in(field: string, values: (string|number)[]) {
        this.getDocument(field)['$in'] = values;
        return this;
    }

    gte(field: string, value: number) {
        this.getDocument(field)['$gte'] = value;
        return this;
    }

    lte(field: string, value: number) {
        this.getDocument(field)['$lte'] = value;
        return this;
    }

    build() {
        return this._match;
    }
}
