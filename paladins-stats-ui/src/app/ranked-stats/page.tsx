import { PaladinsRank } from "@miguelteran/paladins-stats-db";
import { RankedStats } from "./ranked-stats";


const rankGroups = Object.keys(PaladinsRank)
    .filter((v) => isNaN(Number(v)))
    .map((v, i) => { return {id: i, name: v}});


export default async function RankedStatsPage() {

    return (
        <RankedStats
            rankGroups={rankGroups}
        />
    );
}
