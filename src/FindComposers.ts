// import * as zlib from 'zlib';
import {packedComposers} from './all_composers.txt';

interface IDbComposer {
    surname?: string;
    surnames?: string[];
    givenName?: string;
    givenNames?: string[];
    country: string[];
    birth: number;
    death: number;
    note?: string;
}

export interface IComposer {
    id: number;
    surname: string;
    givenName: string;
    country: string;
    birth: number;
    death: number;
    note: string;
}

function base64ToBlob(base64: string,
                      contentType: string = '',
                      sliceSize: number = 512): Blob {
    const byteCharacters = atob(base64);
    const byteArrays = [];

    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        const slice = byteCharacters.slice(offset, offset + sliceSize);

        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
        }

        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
    }

    return new Blob(byteArrays, {type: contentType});
}

async function decompressBlob(blob: Blob) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    return new Response(decompressedStream).blob();
}

async function unpackComposers(packedComposers: string) {
    const blob = base64ToBlob(packedComposers);
    const str = await (await decompressBlob(blob)).text();
    return eval(str) as IDbComposer[];
}

export type QueryType = "surname" | "given";

export interface IQuery {
    expression: string;
    partialMatch: boolean;
    queryType: QueryType;
}

type IndexEntry = {
    name: string;
    index: number;
}

interface IComposerIndex {
    composers: IComposer[];
    surnames: IndexEntry[];
    givenNames: IndexEntry[];
}

function buildIndex(composers: IDbComposer[]): IComposerIndex {
    const resultSurnames: IndexEntry[] = [];
    const resultGivenNames: IndexEntry[] = [];
    const resultComposers: IComposer[] = [];

    for (let i = 0; i < composers.length; i++) {
        const {
            birth,
            country,
            death,
            givenName,
            givenNames,
            note,
            surname,
            surnames
        } = composers[i];

        if (surnames) {
            for (const name of surnames) {
                resultSurnames.push({name: name.toUpperCase(), index: i});
            }
        } else if (surname) {
            resultSurnames.push({name: surname.toUpperCase(), index: i});
        }

        if (givenNames) {
            for (const name of givenNames) {
                resultGivenNames.push({name: name.toUpperCase(), index: i});
            }
        } else if (givenName) {
            resultGivenNames.push({name: givenName.toUpperCase(), index: i});
        }

        resultComposers.push({
            id: i,
            surname: surname || '',
            givenName: givenName || '',
            country: country.join(', '),
            birth: birth,
            death: death,
            note: note || '',
        });
    }

    return {composers: resultComposers, surnames: resultSurnames, givenNames: resultGivenNames};
}

function findComposersByIndex(regExp: RegExp, index: IndexEntry[], composers: IComposer[]): IComposer[] {
    const results: IComposer[] = [];
    const visited = new Set<number>();
    for (const entry of index) {
        if (!visited.has(entry.index) && regExp.test(entry.name)) {
            results.push(composers[entry.index]);
            visited.add(entry.index);
        }
    }
    return results;
}

export interface IComposerDb {
    composers: IComposer[];

    find(query: IQuery): Promise<IComposer[]>;
}

class ComposerDb implements IComposerDb {
    public composers: IComposer[];
    surnames: IndexEntry[];
    givenNames: IndexEntry[];

    constructor(composers: IDbComposer[]) {
        const index = buildIndex(composers);
        this.composers = index.composers;
        this.surnames = index.surnames;
        this.givenNames = index.givenNames;
    }

    public async find(query: IQuery): Promise<IComposer[]> {
        try {
            if (query.expression.length === 0) {
                return [];
            }
            let expression = query.expression;
            if (!query.partialMatch) {
                const prefix = query.expression.startsWith("^") ? "" : "^";
                const suffix = query.expression.endsWith("$") ? "" : "$";
                expression = prefix + query.expression + suffix;
            }
            expression = expression.replace(/\u2026/g, "...");
            const regExp = new RegExp(expression, 'i');
            return findComposersByIndex(
                regExp,
                query.queryType === "surname" ? this.surnames : this.givenNames,
                this.composers
            );

        } catch (e) {
            console.log(e);
            return [];
        }
    }
}

export async function unpackComposerDb(composerDb: string): Promise<IComposerDb> {
    return new ComposerDb(await unpackComposers(composerDb));
}

let DEFAULT_COMPOSER_DB: IComposerDb | null = null;

export async function getDefaultComposerDb() : Promise<IComposerDb> {
    if (DEFAULT_COMPOSER_DB === null) {
        DEFAULT_COMPOSER_DB = await unpackComposerDb(packedComposers);
    }
    return DEFAULT_COMPOSER_DB;
}
