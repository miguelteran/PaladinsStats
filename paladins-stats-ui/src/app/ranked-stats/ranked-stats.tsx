'use client'

import useSWRImmutable from "swr/immutable";
import { SWRResponse } from "swr";
import { useState, Key } from "react"
import { Selection, Spinner } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { Item } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/item";
import { CountFilter } from "@miguelteran/paladins-stats-db/dist/src/models/filter/count-filter";
import { CountResult } from "@miguelteran/paladins-stats-db/dist/src/models/aggregations/count-result";
import { CustomSelect, NamedSelectItem, OnSelectionChange } from "@/components/select";
import { CustomMultiSelect } from "@/components/multiselect";
import { RolesSelect } from "@/components/roles-select";
import { StatsCategory, statsCategories } from "@/models/stats-category";
import { championsMap } from "@/util/static-data";
import { getPercentage } from "@/util/number-util";
import { CHAMPION_ID_FIELD, ITEM_CHAMPION_ID_FIELD, ITEM_ID_FIELD } from "@/util/constants";
import { ChampionsStatsTable, ChampionsStatsTableRow } from "./champions-stats-table";
import { ItemsStatsTable, ItemsStatsTableRow } from "./items-stats-table";
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
    const [ selectedRoles, setSelectedRoles ] = useState<Selection>(new Set([]));
    const [ selectedChampions, setSelectedChampions ] = useState<Selection>(new Set([]));
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
    
    const renderRolesMultiSelect = () => {
        return(
            <RolesSelect
                selectedRoles={selectedRoles}
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
        setSelectedChampions(new Set([]));
        setSelectedRoles(selectedRoles);
    }

    const renderChampionsMultiSelect = () => {
        return(
            <CustomMultiSelect<Champion>
                items={championsForSelect}
                textValueField='Name'
                placeholder='Champions'
                selectedKeys={selectedChampions}
                onSelectionChange={setSelectedChampions}
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

    const getItemsTableRows = (items: Item[], totalCounts: CountResult[], partialCounts: CountResult[]): ItemsStatsTableRow[] => {
        return items.map(item => {
            const champion: Champion = championsMap.get(item.champion_id);
            return {
                ...item,
                Name: champion.Name,
                Roles: champion.Roles,
                percentage: getPercentageForEntry(item, ITEM_ID_FIELD, totalCounts, partialCounts)
            };
        });
    };

    const rowsFilter = (row: any, championIdField: string) => {
        const roles = Array.from(selectedRoles as Iterable<Key>);
        const champions = Array.from(selectedChampions as Iterable<Key>);
        const roleSelected = roles.findIndex(r => r === row.Roles) !== -1;
        const championSelected = champions.findIndex(id => Number(id) === row[championIdField]) !== -1;
        return (roles.length === 0 && champions.length === 0) ||
               (roles.length === 0 && championSelected) ||
               (champions.length === 0 && roleSelected) ||
               (roleSelected && championSelected);
    }

    const championsTableRowsFilter = (row: ChampionsStatsTableRow) => {
        return rowsFilter(row, CHAMPION_ID_FIELD);
    }

    const itemsTableRowsFilter = (row: ItemsStatsTableRow) => {
        return rowsFilter(row, ITEM_CHAMPION_ID_FIELD);
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
        return renderItemsTable(talents, totalCounts, partialCounts);
    };

    const renderCardsTable = (totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return renderItemsTable(cards, totalCounts, partialCounts);
    };

    const renderItemsTable = (items: Item[], totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return (
            <ItemsStatsTable
                rows={getItemsTableRows(items, totalCounts, partialCounts)}
                filter={itemsTableRowsFilter}
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
                {renderRolesMultiSelect()}
                {renderChampionsMultiSelect()}
            </div>
            <div>
                {renderStatsTable()}
            </div>
        </div>
    );
}
