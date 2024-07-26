// import * as zlib from 'zlib';
import {packedComposers} from './data';

let defaultComposerDb: IComposerDb | null = null;

interface IDbComposer {
    surname?: string[];
    givenName?: string[];
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

// function decompressGzip(compressedData: Buffer): Promise<Buffer> {
//     return new Promise((resolve, reject) => {
//         zlib.gunzip(compressedData, (err, decompressedData) => {
//             if (err) {
//                 reject(err);
//             } else {
//                 resolve(decompressedData);
//             }
//         });
//     });
// }

// const decodeBase64 = (base64String: string): string => {
//     // Check if Buffer is available (Node.js environment)
//     if (typeof Buffer !== 'undefined') {
//         return Buffer.from(base64String, 'base64').toString('utf-8');
//     } else {
//         // Assume web environment
//         return atob(base64String);
//     }
// };


async function decompressBlob(blob: Blob) {
    const ds = new DecompressionStream("gzip");
    const decompressedStream = blob.stream().pipeThrough(ds);
    return new Response(decompressedStream).blob();
}

export async function unpackComposers(packedComposers: string) {
    const blob = base64ToBlob(packedComposers);
    const str = await (await decompressBlob(blob)).text();
    return eval(str) as IDbComposer[];
    // return decompressBlob(blob).then((decompressed) => {return decompressed.text();});
}

// export async function getComposers(packedComposers: string): Promise<Composer[]> {
//     const composers = await unpackComposers(packedComposers);
//     const lines = composers.split('\n');
//     const composersList: Composer[] = [];
//     for (const line of lines) {
//         const parts = line.split(';');
//         const composer: Composer = {
//             surname: parts[0].split(' '),
//             givenName: parts[1].split(' '),
//             nationality: parts[2].split(', '),
//             birth: parseInt(parts[3]),
//             death: parseInt(parts[4]),
//             comments: parts[5],
//         };
//         composersList.push(composer);
//     }
//     return composersList;
// }

type Letter = {
    char: string;
    index: number;
};

type Query = {
    length: number;
    letters: Letter[];
};

type IndexEntry = {
    name: string;
    index: number;
}

export interface IComposerDb {
    composers: IComposer[];
    surnames: IndexEntry[];
    givenNames: IndexEntry[];
}

export function buildIndex(composers: IDbComposer[]): IComposerDb {
    const surnames: IndexEntry[] = [];
    const givenNames: IndexEntry[] = [];
    const resultComposers: IComposer[] = [];

    for (let i = 0; i < composers.length; i++) {
        const {
            birth,
            country,
            death,
            givenName,
            note,
            surname
        } = composers[i];

        let joinedSurname = '';
        if (surname) {
            for (const name of surname) {
                surnames.push({name: name.toUpperCase(), index: i});
            }
            joinedSurname = surname.join(' ');
        }

        let joinedGivenName: string = '';
        if (givenName) {
            for (const name of givenName) {
                givenNames.push({name: name.toUpperCase(), index: i});
            }
            joinedGivenName = givenName.join(' ');
        }

        resultComposers.push({
            id: i,
            surname: joinedSurname,
            givenName: joinedGivenName,
            country: country.join(', '),
            birth: birth,
            death: death,
            note: note || '',
        });
    }

    const compare = (a: IndexEntry, b: IndexEntry) => {
        if (a.name.length !== b.name.length) {
            return a.name.length - b.name.length;
        }
        return a.name.localeCompare(b.name);
    }

    surnames.sort(compare);
    givenNames.sort(compare);
    return {composers: resultComposers, surnames, givenNames};
}

export async function getDefaultComposerDb()
{
    if (defaultComposerDb === null) {
        defaultComposerDb = buildIndex(await unpackComposers(packedComposers));
    }
    return defaultComposerDb;
}

function buildQuery(name: string): Query {
    const letters: Letter[] = [];
    for (let i = 0; i < name.length; i++) {
        letters.push({char: name[i].toUpperCase(), index: i});
    }
    return {length: name.length, letters};
}

// function binarySearch(query: Query, index: IndexEntry[], db: ComposerDb): IComposer[] {
//     const results: IComposer[] = [];
//     let min = 0;
//     let max = index.length - 1;
//     while (min <= max) {
//         const mid = Math.floor((min + max) / 2);
//         const entry = index[mid];
//         let i = 0;
//         let j = 0;
//         while (i < query.length && j < entry.name.length) {
//             if (query.letters[i].char === entry.name[j]) {
//                 i++;
//             }
//             j++;
//         }
//         if (i === query.length) {
//             results.push(entry.index);
//         }
//         if (query.letters[i].char < entry.name[j]) {
//             max = mid - 1;
//         } else {
//             min = mid + 1;
//         }
//     }
//     return results;
// }

export function findComposerSurnames(query: string, db: IComposerDb): IDbComposer[] {
    // var composers: string;
    console.log("Hello from findComposer");
    return [];
}
