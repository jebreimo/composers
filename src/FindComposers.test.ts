import {expect, test} from '@jest/globals';
import {unpackComposerDb} from "./FindComposers";

const fourComposers = "\
H4sIAOADwmYC/41QuQ6CQBD9FTI1DcYj0mmjhdJQKgW6E1hdZ5PhiMbwW8beH3NBo65HsJrM\
m5d3zOIIWcEU7xB8CHOWJFbICbiQyBIpuB2mSCy3BlzrgnI+gL+AsESWCULkwkpynhqaN+x1\
DUlg3KxQuZb65SSQVUEiNaQ7njVS1iXUjyWyY4xZszPao3KWMJNKoVMjS3hN2wjWsAFrqhlP\
ai3YVsHrvFQwjQYfNc6U5VhqJd6+NCmIYra/FGhuMRh6fxvM4803dfdHkYHt04cqugJEObl3\
7wEAAA==";

test('unpacking the composers BLOB', async () => {
    const db = await unpackComposerDb(fourComposers);
    expect(db.composers.length).toEqual(4);
    expect(db.composers[1].givenName).toEqual('Bror Axel "Lille Bror"');
    expect(db.composers[3].country).toEqual('Norge, Sverige');
});

test('find one of the composers', async () => {
    const db = await unpackComposerDb(fourComposers);
    const composers = await db.find({expression: ".{2}j", queryType: "given", partialMatch: false});
    expect(composers.length).toEqual(1);
    expect(composers[0].givenName).toEqual('Maj');
    expect(composers[0].surname).toEqual('Sønstevold');
});
