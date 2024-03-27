'use client'

import { useState, Key } from "react"
import { Selection } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { CountFilter } from "@miguelteran/paladins-stats-db/dist/src/models/count-filter";
import { CustomSelect, NamedSelectItem, OnSelectionChange } from "@/components/select";
import { RolesSelect } from "@/components/roles-select";
import { StatsCategory, statsCategories, perChampionStatsCategories } from "@/models/stats-category";
import { CARD_PICKS_URI, CHAMPION_BANS_URI, CHAMPION_PICKS_URI, CHAMPION_WINS_URI, TALENT_PICKS_URI, TALENT_WINS_URI } from "@/util/constants";
import { ChampionsStatsTable } from "./champions-stats-table";
import { ChampionCardsStatsTable } from "./champion-cards-stats-table";
import { ItemsStatsTable } from "./items-stats-table";
import champions from '../../../public/champions.json';
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
                    uri: CHAMPION_PICKS_URI,
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
                    uri: CHAMPION_WINS_URI,
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
                    uri: CHAMPION_BANS_URI,
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
                    uri: CARD_PICKS_URI,
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
                    uri: TALENT_PICKS_URI,
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
                    uri: TALENT_WINS_URI,
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
            <div id='ranked-stats-table-container' className='flex w-full min-h-dvh place-content-center'>
                {renderStatsTable()}
            </div>
        </div>
    );
}
