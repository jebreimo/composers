// import * as zlib from 'zlib';
import {packedComposers} from './data';

type Composer = {
    surname: string[];
    givenName: string[];
    nationality: string[];
    birth: number;
    death: number;
    comments: string;
    language?: string;
};

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


export async function unpackComposers(packedComposers: string): Promise<string> {
    const blob = base64ToBlob(packedComposers);
    return (await decompressBlob(blob)).text();
    // return decompressBlob(blob).then((decompressed) => {return decompressed.text();});
}

export async function getComposers(packedComposers: string): Promise<Composer[]> {
    const composers = await unpackComposers(packedComposers);
    const lines = composers.split('\n');
    const composersList: Composer[] = [];
    for (const line of lines) {
        const parts = line.split(';');
        const composer: Composer = {
            surname: parts[0].split(' '),
            givenName: parts[1].split(' '),
            nationality: parts[2].split(', '),
            birth: parseInt(parts[3]),
            death: parseInt(parts[4]),
            comments: parts[5],
        };
        composersList.push(composer);
    }
    return composersList;
}

export function findComposer(query: string): Composer[] {
    // var composers: string;
    console.log("Hello from findComposer");
    return [];
}
