export enum PaladinsRank {
    Qualifying = 0,
    Bronze,
    Silver,
    Gold,
    Platinum,
    Diamond,
    Master,
    Grandmaster
}

export function getRankFromString(rank: string): PaladinsRank {
    return PaladinsRank[rank as keyof typeof PaladinsRank];
}

export function getRankBoundaries(rank: PaladinsRank): number[] {
    switch (rank) {
        case PaladinsRank.Qualifying:
            return [0];
        case PaladinsRank.Bronze:
            return [1,5];
        case PaladinsRank.Silver:
            return [6,10];
        case PaladinsRank.Gold:
            return [11,15];
        case PaladinsRank.Platinum:
            return [16,20];
        case PaladinsRank.Diamond:
            return [21,25];
        case PaladinsRank.Master:
            return [26];
        case PaladinsRank.Grandmaster:
            return [27];
        default:
            throw new Error('Invalid rank ' + rank);
    }
}
