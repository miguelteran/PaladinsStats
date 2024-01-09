'use client'

import { Key, useCallback, useState } from "react";
import { SortDescriptor } from "@nextui-org/react";
import { ChampionCard } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/loadout";
import { ImageWithTooltip } from "@/components/image-with-tooltip";
import { StatsTableRow } from "@/models/stats-table-row";
import { getPercentageString } from "@/util/string-util";
import { CHAMPION_CARD_ID_FIELD } from "@/util/constants";
import { CustomTable, CustomTableColumn, CustomTableRowsFilter, CustomTableSortingDirection } from "../../components/table";


export type ChampionCardsStatsTableRow = ChampionCard & StatsTableRow;

export type ChampionCardsStatsMode = 'Card' | 'Talent';

export interface ChampionCardsStatsTableProps {
    mode: ChampionCardsStatsMode;
    rows: ChampionCardsStatsTableRow[];
    filter: CustomTableRowsFilter<ChampionCardsStatsTableRow>;
}

export function ChampionCardsStatsTable(props: ChampionCardsStatsTableProps) {

    const { mode, rows, filter } = props;

    const [ sortDescriptor, setSortDescriptor ] = useState<SortDescriptor>({
        column: 'percentage',
        direction: CustomTableSortingDirection.DESCENDING_SORTING_DIRECTION,
    });

    const renderCell = useCallback((row: ChampionCardsStatsTableRow, columnKey: Key) => {
        if (columnKey === 'percentage') {
            return getPercentageString(row.percentage);
        } else if (columnKey === 'image') {
            return (
                <ImageWithTooltip 
                    key={row.card_id2} 
                    content={row.card_description}
                    imageUrl={mode === 'Card' ? row.championCard_URL : (row.championTalent_URL ?? '')}
                />
            );
        }
        return undefined;
    }, [rows, mode]);

    const columns: CustomTableColumn[] = [
        { key: 'card_name', label: mode, sortable: true },
        { key: 'image', label: '' },
        { key: 'percentage', label: 'Rate', sortable: true }
    ];

    return (
        <CustomTable<ChampionCardsStatsTableRow>
            rows={rows}
            columns={columns}
            tableRowKey={CHAMPION_CARD_ID_FIELD}
            customCellRenderer={renderCell}
            rowsFilter={filter}
            sortParams={{
                sortDescriptor: sortDescriptor,
                onSortChange: setSortDescriptor
            }}
        />
    );
}
