'use client'

import { Key, useCallback } from "react";
import { Selection } from "@nextui-org/react";
import { ChampionCard } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/loadout";
import { ImageWithTooltip } from "@/components/image-with-tooltip";
import { CustomTableColumn } from "../../components/table";
import { RANKED_STATS_TABLE_COLUMN_WIDTH } from "@/util/constants";
import { CountRequest, StatsTable, StatsTableRow } from "./stats-table";
import cards from '../../../public/champion-cards.json';
import talents from '../../../public/champion-talents.json';


const ROWS_PER_PAGE = 6;

export type ChampionCardsStatsMode = 'Card' | 'Talent';

export interface ChampionCardsStatsTableProps {
    request: CountRequest;
    selectedChampion: Selection;
    mode: ChampionCardsStatsMode;
}

export function ChampionCardsStatsTable(props: ChampionCardsStatsTableProps) {

    const { request, selectedChampion, mode } = props;

    const renderCell = useCallback((row: StatsTableRow<ChampionCard>, columnKey: Key) => {
        if (columnKey === 'image') {
            return (
                <ImageWithTooltip 
                    key={row.card_id2} 
                    content={row.card_description}
                    imageUrl={mode === 'Card' ? row.championCard_URL : (row.championTalent_URL ?? '')}
                />
            );
        }
        return undefined;
    }, [mode]);

    const rowsFilter = (row: StatsTableRow<ChampionCard>) => {
        const champions = Array.from(selectedChampion as Set<Key>);
        return champions.length !== 0 && champions.findIndex(id => Number(id) === row.champion_id) !== -1;
    }

    const columns: CustomTableColumn[] = [
        { key: 'card_name', label: mode, sortable: true, width: RANKED_STATS_TABLE_COLUMN_WIDTH },
        { key: 'image', label: '', width: RANKED_STATS_TABLE_COLUMN_WIDTH },
        { key: 'percentage', label: 'Rate', sortable: true },
        // for debugging
        // { key: 'partial', label: 'Partial'},
        // { key: 'total', label: 'Total'},
    ];

    return (
        <StatsTable<ChampionCard>
            request={request}
            objects={mode === 'Card' ? cards : talents}
            idField='card_id2'
            columns={columns}
            cellRenderer={renderCell}
            rowsFilter={rowsFilter}
            rowsPerPage={ROWS_PER_PAGE}
        />
    );
}
