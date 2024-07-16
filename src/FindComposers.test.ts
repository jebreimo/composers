import {expect, test} from '@jest/globals';
import {getComposers, unpackComposers} from "./FindComposers";

const fourComposers = "\
H4sIANfvlmYC/wsuKcrMS0lKLUq39kjNK8rMtg4uSy3KTE+1NrQ0NbG25go+vC0ltSinNC8l\
w9qpKL9IwbEiNUdBySczJydVASSghKTD0AikzRyka0decUlqWX5OirV7aV5eYpG1X34RQo2l\
Iaoa38QsiAIdBSTTzEEqzawB3UBrFqQAAAA=";

test('unpacking the composers BLOB', async () => {
    const composers = await unpackComposers(fourComposers);
    expect(composers.length).toEqual(161);
});

test('producing a list of composers', async () => {
    const composers = await getComposers(fourComposers)
    expect(composers.length).toEqual(4);
    expect(composers[1].givenName).toEqual(['Bror', 'Axel', '"Lille', 'Bror"']);
});
