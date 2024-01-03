'use client'

import useSWRImmutable from "swr/immutable";
import { SWRResponse } from "swr";
import { useState, Key } from "react"
import { Selection, Spinner } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { Item } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/item";
import { CountFilter } from "@miguelteran/paladins-stats-db/dist/src/models/filter/count-filter";
import { CountResult } from "@miguelteran/paladins-stats-db/dist/src/models/aggregations/count-result";
import { PercentagesTable, PercentagesTableRow } from "@/app/ranked-stats/percentages-table";
import { CustomTableColumn } from "@/components/table";
import { CustomSelect, NamedSelectItem, OnSelectionChange } from "@/components/select";
import { CustomMultiSelect } from "@/components/multiselect";
import { RolesSelect } from "@/components/roles-select";
import { PaladinsRoles } from "@/models/role";
import { StatsCategory, statsCategories } from "@/models/stats-category";
import { championsMap } from "@/util/static-data";
import champions from '../../../public/champions.json';
import talents from '../../../public/champion-talents.json';
import regions from '../../../public/regions.json';
import rankedMaps from '../../../public/ranked-maps.json';
import platforms from '../../../public/platforms.json';


const championsTableColumns: CustomTableColumn[] = [
    { key: 'championName', label: 'Champion', sortable: true },
    { key: 'percentage', label: 'Rate', sortable: true }
];

const talentsTableColumns: CustomTableColumn[] = [
    { key: 'talentName', label: 'Talent', sortable: true },
    { key: 'championName', label: 'Champion', sortable: true },
    { key: 'percentage', label: 'Rate', sortable: true }
];

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
                textValueField="Name"
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

    const renderChampionsTable = (totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return (
            <PercentagesTable<Champion>
                totalCounts={totalCounts} 
                partialCounts={partialCounts}
                entries={champions}
                entryId='id'
                getPercentagesTableRow={getChampionsTableRow}
                columns={championsTableColumns}
                filter={rowsFilter}
            />
        );
    };

    const renderTalentsTable = (totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return (
            <PercentagesTable<Item>
                totalCounts={totalCounts} 
                partialCounts={partialCounts}
                entries={talents}
                entryId='ItemId'
                getPercentagesTableRow={getTalentsTableRow}
                columns={talentsTableColumns}
                filter={rowsFilter}
            />
        );
    };

    const rowsFilter = (row: PercentagesTableRow) => {
        const championId = row.championId || row.id;
        const roles = Array.from(selectedRoles as Iterable<Key>);
        const champions = Array.from(selectedChampions as Iterable<Key>);
        const roleSelected = roles.findIndex(r => r === row.role) !== -1;
        const championSelected = champions.findIndex(id => Number(id) === championId) !== -1;
        return (roles.length === 0 && champions.length === 0) ||
               (roles.length === 0 && championSelected) ||
               (champions.length === 0 && roleSelected) ||
               (roleSelected && championSelected);
    }

    const getChampionsTableRow = (champion: Champion): PercentagesTableRow => {
        return {
            id: champion.id,
            championName: champion.Name,
            role: champion.Roles as PaladinsRoles,
            percentage: 0
        }
    }

    const getTalentsTableRow = (talent: Item): PercentagesTableRow => {
        const champion: Champion = championsMap.get(talent.champion_id);
        return {
            id: talent.ItemId,
            championId: champion.id,
            championName: champion.Name,
            talentName: talent.DeviceName,
            role: champion.Roles as PaladinsRoles,
            percentage: 0
        }
    }

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
