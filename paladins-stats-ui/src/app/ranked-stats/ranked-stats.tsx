'use client'

import useSWRImmutable from "swr/immutable";
import { useState, Key } from "react"
import { Selection } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { CountFilter } from "@/models/count-filter";
import { StatsDateRange } from "@/models/stats-date-range";
import { CustomSelect, NamedSelectItem, OnSelectionChange } from "@/components/select";
import { TextWithLabel } from "@/components/text-with-label";
import { RolesSelect } from "@/components/roles-select";
import { StatsCategory, statsCategories, perChampionStatsCategories } from "@/models/stats-category";
import { getRankedMaps, getStatsDateRange } from "../actions";
import { ChampionsStatsTable } from "./champions-stats-table";
import { ChampionCardsStatsTable } from "./champion-cards-stats-table";
import { ItemsStatsTable } from "./items-stats-table";
import champions from '../../../public/champions.json';
import regions from '../../../public/regions.json';
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
        const category = getSelectedItemId(selectedCategory);
        if (perChampionStatsCategories.findIndex(c => c === category) === -1) {
            return undefined;
        }
        return(
            <CustomSelect<Champion>
                isRequired={category !== StatsCategory.Items}
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
                return renderChampionPicksTable();
            case StatsCategory.ChampionWins:
                return renderChampionWinsTable();
            case StatsCategory.ChampionBans:
                return renderChampionBansTable();
            case StatsCategory.ChampionCards:
                return renderChampionCardsTable();
            case StatsCategory.TalentPicks:
                return renderTalentPicksTable();
            case StatsCategory.TalentWins:
                return renderTalenWinsTable();
            case StatsCategory.Items:
                return renderItemsTable();
            default:
                return undefined;
        }
    }

    const renderChampionPicksTable = () => {
        return (
            <ChampionsStatsTable
                request={{
                    statsCategory: StatsCategory.ChampionPicks,
                    filter: countFilter
                }}
                selectedRole={selectedRole}
            />
        );
    };

    const renderChampionWinsTable = () => {
        return (
            <ChampionsStatsTable
                request={{
                    statsCategory: StatsCategory.ChampionWins,
                    filter: countFilter
                }}
                selectedRole={selectedRole}
            />
        );
    };

    const renderChampionBansTable = () => {
        return (
            <ChampionsStatsTable
                request={{
                    statsCategory: StatsCategory.ChampionBans,
                    filter: countFilter
                }}
                selectedRole={selectedRole}
            />
        );
    };

    const renderChampionCardsTable = () => {
        if (!getSelectedItemId(selectedChampion)) {
            return undefined;
        }
        return (
            <ChampionCardsStatsTable
                request={{
                    statsCategory: StatsCategory.ChampionCards,
                    filter: countFilter
                }}
                selectedChampion={selectedChampion}
                mode='Card'
            />
        );
    };

    const renderTalentPicksTable = () => {
        if (!getSelectedItemId(selectedChampion)) {
            return undefined;
        }
        return (
            <ChampionCardsStatsTable
                request={{
                    statsCategory: StatsCategory.TalentPicks,
                    filter: countFilter
                }}
                selectedChampion={selectedChampion}
                mode='Talent'
            />
        );
    };

    const renderTalenWinsTable = () => {
        if (!getSelectedItemId(selectedChampion)) {
            return undefined;
        }
        return (
            <ChampionCardsStatsTable
                request={{
                    statsCategory: StatsCategory.TalentWins,
                    filter: countFilter
                }}
                selectedChampion={selectedChampion}
                mode='Talent'
            />
        );
    };

    const renderItemsTable = () => {
        return (
            <ItemsStatsTable
                filter={{...countFilter, champion: getSelectedItemId(selectedChampion)}}
            />
        );
    };

    // const renderStatsDateRange = (dateRange: StatsDateRange) => {
    //     return (
            
    //     );
    // }

    const rankedMaps = useSWRImmutable('ranked-maps', getRankedMaps).data ?? [];
    const dateRange: StatsDateRange|undefined = useSWRImmutable('date-range', getStatsDateRange).data;

    const countFilter: CountFilter = {
        region: getSelectedItemName(regions, selectedRegion),
        map: getSelectedItemName(rankedMaps, selectedMap),
        rank: getSelectedItemId(selectedRank),
        platform: getSelectedItemName(platforms, selectedPlatform)
    };

    return (
        <div>
            <div id='ranked-stats-selects-container' className='flex flex-row flex-wrap w-full columns-8 gap-2 pb-4'>
                {renderSelects(statsCategories, 'Category', selectedCategory, setSelectedCategory)}
                {renderSelects(regions, 'Region', selectedRegion, setSelectedRegion)}
                {renderSelects(rankGroups, 'Rank', selectedRank, setSelectedRank)}
                {renderSelects(rankedMaps, 'Map', selectedMap, setSelectedMap)}
                {renderSelects(platforms, 'Platform', selectedPlatform, setSelectedPlatform)}
                {renderRolesSelect()}
                {renderChampionsSelect()}
            </div>
            {dateRange ? 
                <div id='ranked-stats-dates' className='flex flex-row flex-wrap w-full gap-4 pb-4'>
                    <TextWithLabel label='Start Date' value={dateRange.startDate}/>
                    <TextWithLabel label='End Date' value={dateRange.endDate}/>
                </div> : undefined
            }
            <div id='ranked-stats-table-container' className='flex w-full min-h-dvh place-content-center'>
                {renderStatsTable()}
            </div>
        </div>
    );
}
