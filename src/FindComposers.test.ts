import {expect, test} from '@jest/globals';
import {unpackComposers} from "./FindComposers";

const fourComposers = "\
H4sIAKrhlmYC/wsuKcrMS0lKLUq39kjNK8rMtg4uSy3KTE+1trbmCj68LSW1KKc0LyXD2icz\
JydVwakovwiuwtDS0AhImJqDVO7IKy5JLcvPSbF2L83LSyyy9ssvQqixNERV45uYBVGgo4Bk\
mjlIpZk1AMSaR3iUAAAA";

test('unpacking the composers BLOB', async () => {
    const composers = await unpackComposers(fourComposers);
    expect(composers.length).toEqual(145);
});
