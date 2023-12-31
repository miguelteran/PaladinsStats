import championsList from '../../public/champions.json';

export const championsMap = toMap(championsList, 'id');

function toMap(entries: any[], key: string) {
    return new Map(entries.map(e => [e[key], e]))
}