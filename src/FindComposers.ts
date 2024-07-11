type Composer = {
    givenName: string;
    surname: string;
    birth: number;
    death: number;
    nationality: [string];
    comments: string;
    language?: string;
};

export function findComposer(query: string): Composer[] {
    return [];
}
