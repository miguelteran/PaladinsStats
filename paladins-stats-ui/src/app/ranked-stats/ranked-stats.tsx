'use client'

import useSWRImmutable from "swr/immutable";
import { SWRResponse } from "swr";
import { useState, Key } from "react"
import { Selection, Spinner } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { ChampionCard } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/loadout";
import { CountFilter } from "@miguelteran/paladins-stats-db/dist/src/models/filter/count-filter";
import { CountResult } from "@miguelteran/paladins-stats-db/dist/src/models/aggregations/count-result";
import { CustomSelect, NamedSelectItem, OnSelectionChange } from "@/components/select";
import { RolesSelect } from "@/components/roles-select";
import { StatsCategory, itemsStatsCategories, statsCategories } from "@/models/stats-category";
import { getPercentage } from "@/util/number-util";
import { CHAMPION_CARD_ID_FIELD, CHAMPION_ID_FIELD } from "@/util/constants";
import { ChampionsStatsTable, ChampionsStatsTableRow } from "./champions-stats-table";
import { ChampionCardsStatsMode, ChampionCardsStatsTable, ChampionCardsStatsTableRow } from "./champion-cards-stats-table";
import champions from '../../../public/champions.json';
import cards from '../../../public/champion-cards.json';
import talents from '../../../public/champion-talents.json';
import regions from '../../../public/regions.json';
import rankedMaps from '../../../public/ranked-maps.json';
import platforms from '../../../public/platforms.json';


export interface RankedStatsProps {
    rankGroups: NamedSelectItem[];
}

export const RankedStats = (props: RankedStatsProps) => {

    const { rankGroups } = props;
    
    const [ selectedCategory, setSelectedCategory ] = useState<Selection>(new Set([StatsCategory.ChampionPicks.toString()]));
    const [ selectedRegion, setSelectedRegion ] = useState<Selection>(new Set([]));
    const [ selectedMap, setSelectedMap ] = useState<Selection>(new Set([]));
    const [ selectedRank, setSelectedRank ] = useState<Selection>(new Set([]));
    const [ selectedPlatform, setSelectedPlatform ] = useState<Selection>(new Set([]));
    const [ selectedRole, setSelectedRole ] = useState<Selection>(new Set([]));
    const [ selectedChampion, setSelectedChampion ] = useState<Selection>(new Set([]));
    const [ championsForSelect, setChampionsForSelect ] = useState<Champion[]>(champions);

    const getSelectedItemId = (selection: Selection) => {
        const key = Array.from(selection as Iterable<Key>)[0];
        return key ? Number(key.toString()) : undefined;
    }

    const getSelectedItemName = (items: NamedSelectItem[], selection: Selection) => {
        const item = items.find(i => {
            const id = getSelectedItemId(selection);
            if (id) {
                return i.id === id;
            }
        });
        return item && item.name;
    }

    const getCounts = (uri: string, filter: CountFilter) => useSWRImmutable([uri, filter], ([uri, filter]) => countFetcher(uri, filter));
        
    const countFetcher = (uri: string, filter: CountFilter) => 
        fetch(`http://localhost:3000/api/${uri}`, {
            method: 'POST',
            body: JSON.stringify(filter)
        }).then(res => res.json());

    const renderSelects = (items: NamedSelectItem[], placeholder: string, selectedKeys: Iterable<Key>, onSelectionChange: OnSelectionChange) => {
        return (
            <CustomSelect<NamedSelectItem>
                items={items}
                placeholder={placeholder}
                selectionMode='single'
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
            />
        );
    };
    
    const renderRolesSelect = () => {
        return(
            <RolesSelect
                selectedRoles={selectedRole}
                onSelectedRolesChange={onSelectedRolesChange}
            />
        );
    }

    const onSelectedRolesChange = (selectedRoles: Selection) => {
        if (selectedRoles === 'all' || selectedRoles.size === 0) {
            setChampionsForSelect(champions);
        } else {
            setChampionsForSelect(champions.filter(champion => selectedRoles.has(champion.Roles)));
        }
        setSelectedChampion(new Set([]));
        setSelectedRole(selectedRoles);
    }

    const renderChampionsSelect = () => {
        if (itemsStatsCategories.findIndex(c => c === getSelectedItemId(selectedCategory)) === -1) {
            return undefined;
        }
        return(
            <CustomSelect<Champion>
                isRequired
                items={championsForSelect}
                textValueField='Name'
                placeholder='Champions'
                selectedKeys={selectedChampion}
                onSelectionChange={setSelectedChampion}
            />
        );
    }

    const renderStatsTable = () => {
        const statsCategory = getSelectedItemId(selectedCategory);
        switch(statsCategory) {
            case StatsCategory.ChampionPicks:
                return renderPercentagesTable(matchCountResponse, championsMatchCountResponse, renderChampionsTable);
            case StatsCategory.ChampionWins:
                return renderPercentagesTable(championsMatchCountResponse, championsWinCountResponse, renderChampionsTable);
            case StatsCategory.ChampionBans:
                return renderPercentagesTable(matchCountResponse, championsBanCountResponse, renderChampionsTable);
            case StatsCategory.ChampionCards:
                return renderPercentagesTable(matchCountResponse, championsCardCountResponse, renderCardsTable);
            case StatsCategory.TalentPicks:
                return renderPercentagesTable(matchCountResponse, talentsMatchCountResponse, renderTalentsTable);
            case StatsCategory.TalentWins:
                return renderPercentagesTable(talentsMatchCountResponse, talentsWinCountResponse, renderTalentsTable);
            default:
                return undefined;
        }
    }

    const renderPercentagesTable = (totalCountResponse: SWRResponse, partialCountResponse: SWRResponse, renderTable: (totalCounts: CountResult[], partialCounts: CountResult[]) => any) => {
        if (totalCountResponse.isLoading || partialCountResponse.isLoading) {
            return <Spinner/>;
        }
        return renderTable(totalCountResponse.data ?? [], partialCountResponse.data ?? []);
    };
    
    const getPercentageForEntry = (entry: any, idField: string, totalCounts: CountResult[], partialCounts: CountResult[]): number => {
        const totalCount = totalCounts.length === 1 ? totalCounts[0] : totalCounts.find(matchCount => matchCount.id === entry[idField]);
        const partialCount = partialCounts.find(matchCount => matchCount.id === entry[idField]);
        return totalCount && totalCount.count !== 0 ? getPercentage(totalCount.count, partialCount ? partialCount.count : 0) : 0;
    };

    const getChampionsTableRows = (totalCounts: CountResult[], partialCounts: CountResult[]): ChampionsStatsTableRow[] => {
        return champions.map(champion => {
            return {
                ...champion,
                percentage: getPercentageForEntry(champion, CHAMPION_ID_FIELD, totalCounts, partialCounts)
            };
        });
    };

    const getChampionCardsTableRows = (cards: ChampionCard[], totalCounts: CountResult[], partialCounts: CountResult[]): ChampionCardsStatsTableRow[] => {
        return cards.map(card => {
            return {
                ...card,
                percentage: getPercentageForEntry(card, CHAMPION_CARD_ID_FIELD, totalCounts, partialCounts)
            };
        });
    };

    const championsTableRowsFilter = (row: ChampionsStatsTableRow) => {
        const roles = Array.from(selectedRole as Set<Key>);
        return roles.length === 0 || roles.findIndex(r => r === row.Roles) !== -1;
    }

    const championCardsTableRowsFilter = (row: ChampionCardsStatsTableRow) => {
        const champions = Array.from(selectedChampion as Set<Key>);
        return champions.length !== 0 && champions.findIndex(id => Number(id) === row.champion_id) !== -1;
    }

    const renderChampionsTable = (totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return (
            <ChampionsStatsTable
                rows={getChampionsTableRows(totalCounts, partialCounts)}
                filter={championsTableRowsFilter}
            />
        );
    };

    const renderTalentsTable = (totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return renderChampionCardsTable('Talent', totalCounts, partialCounts);
    };

    const renderCardsTable = (totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return renderChampionCardsTable('Card', totalCounts, partialCounts);
    };

    const renderChampionCardsTable = (mode: ChampionCardsStatsMode, totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return (
            <ChampionCardsStatsTable
                mode={mode}
                rows={getChampionCardsTableRows(mode === 'Card' ? cards : talents, totalCounts, partialCounts)}
                filter={championCardsTableRowsFilter}
            />
        );
    };

    const matchCountFilter: CountFilter = {
        region: getSelectedItemName(regions, selectedRegion),
        map: getSelectedItemName(rankedMaps, selectedMap),
        rank: getSelectedItemId(selectedRank),
        platform: getSelectedItemName(platforms, selectedPlatform)
    };

    const winCountFilter = { ...matchCountFilter };
    winCountFilter.matchResult = 'Winner';

    const matchCountResponse = getCounts('total-match-count', matchCountFilter);
    const championsMatchCountResponse = getCounts('champions-match-count', matchCountFilter);
    const championsWinCountResponse = getCounts('champions-match-count', winCountFilter);
    const championsBanCountResponse = getCounts('champions-ban-count', matchCountFilter);
    const championsCardCountResponse = getCounts('champions-card-count', matchCountFilter);
    const talentsMatchCountResponse = getCounts('talents-match-count', matchCountFilter);
    const talentsWinCountResponse = getCounts('talents-match-count', winCountFilter);

    return (
        <div>
            <div>
                {renderSelects(statsCategories, 'Category', selectedCategory, setSelectedCategory)}
                {renderSelects(regions, 'Region', selectedRegion, setSelectedRegion)}
                {renderSelects(rankGroups, 'Rank', selectedRank, setSelectedRank)}
                {renderSelects(rankedMaps, 'Map', selectedMap, setSelectedMap)}
                {renderSelects(platforms, 'Platform', selectedPlatform, setSelectedPlatform)}
                {renderRolesSelect()}
                {renderChampionsSelect()}
            </div>
            <div>
                {renderStatsTable()}
            </div>
        </div>
    );
}
