import {expect, test} from '@jest/globals';
import {unpackComposers} from "./FindComposers";

const fourComposers = "\
H4sIACy4l2YC/5XPsQ6CQAwG4FcxnVkwKoFNFx2UxZEwHF6Dp2cvKXdEY3gt4+6LCcRBRKNO\
l/5t8/WSMxSOSRwQogTWlhXJDDmH1INclUjxo7VAYrVv4o1xZPnUzpfIKscmzRTbLUTgh+MR\
eCBRtCVUXle4XSSydiS3PWLGhuvV6RF1/SyV1jhosx9Qf/iE1jcEffhKhcXSaNmD545IvDKx\
4S9I6P+DrMTureB9+FDQtSZQpXdZgwfarQEAAA==";

test('unpacking the composers BLOB', async () => {
    const composers = await unpackComposers(fourComposers);
    expect(composers.length).toEqual(4);
    expect(composers[1].givenName).toEqual(['Bror', 'Axel', 'Lille Bror']);
    expect(composers[3].country).toEqual(['Norge', 'Sverige']);
});
