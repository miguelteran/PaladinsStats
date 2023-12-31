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
import { CustomSelect, NamedSelectItem } from "@/components/select";
import { StatsCategory, statsCategories } from "@/models/stats-category";
import { championsMap } from "@/util/static-data";
import champions from '../../../public/champions.json';
import talents from '../../../public/champion-talents.json';
import regions from '../../../public/regions.json';
import rankedMaps from '../../../public/ranked-maps.json';
import platforms from '../../../public/platforms.json';


const championsTableColumns: CustomTableColumn[] = [
    { key: 'champion', label: 'Champion', sortable: true },
    { key: 'percentage', label: 'Rate', sortable: true }
];

const talentsTableColumns: CustomTableColumn[] = [
    { key: 'talent', label: 'Talent', sortable: true },
    { key: 'champion', label: 'Champion', sortable: true },
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

    const renderSelects = (items: NamedSelectItem[], placeholder: string, selectedKeys: Iterable<Key>, onSelectionChange: (keys: Selection) => any) => {
        return (
            <CustomSelect<NamedSelectItem>
                items={items}
                keyField='id'
                textValueField='name'
                placeholder={placeholder}
                selectionMode='single'
                selectedKeys={selectedKeys}
                onSelectionChange={onSelectionChange}
            />
        );
    };

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
            />
        );
    };

    const getChampionsTableRow = (champion: Champion): PercentagesTableRow => {
        return {
            id: champion.id,
            champion: champion.Name,
            percentage: 0
        }
    }

    const getTalentsTableRow = (talent: Item): PercentagesTableRow => {
        return {
            id: talent.ItemId,
            talent: talent.DeviceName,
            champion: championsMap.get(talent.champion_id).Name,
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
            </div>
            <div>
                {renderStatsTable()}
            </div>
        </div>
    );
}
