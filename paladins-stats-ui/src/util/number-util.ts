export function getPercentage(total: number, partial: number): number {
    return ((partial / total) * 100.0);
}

export function getKDARatio(kills: number, deaths: number, assists: number): number {
    return ((kills + (assists/2)) / deaths)
}
