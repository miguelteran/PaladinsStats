export function getPercentageString(percentage: number): string {
    return percentage.toFixed(2) + '%';
}

export function getTimeString(value: number, unit: 'minutes'|'seconds'): string {
    if (value < 60) {
        return `${value} ${unit === 'minutes' ? 'm' : 's'}`;
    } else {
        const firstPart = value / 60;
        const secondPart = value % 60;
        return `${firstPart.toFixed(0)} ${unit === 'minutes' ? 'h' : 'm'} ${secondPart} ${unit === 'minutes' ? 'm' : 's'}`;
    }
}

export function getKDARatioString(kills: number, deaths: number, assists: number): string {
    return ((kills + (assists/2)) / deaths).toFixed(2)
}