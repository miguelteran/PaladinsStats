// import championSummaries from "../../public/champion-summaries.json";
import { PaladinsRoles } from "./role";

export interface ChampionSummary {
    id: string,
    name: string,
    role: PaladinsRoles
}

// const championSummaries: ChampionSummary[] = readJsonFile('championSummaries.json');