import championsList from '../../public/champions.json';
import ranks from '../../public/ranks.json';

export const championsMap = toMap(championsList, 'id');

function toMap(entries: any[], key: string) {
    return new Map(entries.map(e => [e[key], e]))
}

export function getRank(rankId: number) {
    return ranks.find(rank => rank.id === rankId)?.name;
}