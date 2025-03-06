export const makeGoogleQuery = (givenName: string, surname: string): string =>
    `https://www.google.com/search?q=${givenName.replace(/ /g, '+')}+${surname.replace(/ /g, '+')}`;
