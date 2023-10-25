export function getPercentageString(percentage: number): string {
    return percentage.toFixed(2) + '%';
}

export function getTimeString(minutes: number): string {
    if (minutes < 60) {
        return `${minutes} m`;
    } else {
        const hours = minutes / 60;
        const mins = minutes % 60;
        return `${hours.toFixed(0)} h ${mins} m`;
    }
}

export function getKDARatioString(kills: number, deaths: number, assists: number): string {
    return ((kills + (assists/2)) / deaths).toFixed(2)
}