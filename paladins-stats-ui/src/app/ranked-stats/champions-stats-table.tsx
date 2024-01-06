'use client'

import { Key, useCallback, useState } from "react";
import { SortDescriptor } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { StatsTableRow } from "@/models/stats-table-row";
import { getPercentageString } from "@/util/string-util";
import { CHAMPION_ID_FIELD } from "@/util/constants";
import { CustomTable, CustomTableColumn, CustomTableRowsFilter, CustomTableSortingDirection } from "../../components/table";


const columns: CustomTableColumn[] = [
    { key: 'Name', label: 'Champion', sortable: true },
    { key: 'percentage', label: 'Rate', sortable: true }
];

export type ChampionsStatsTableRow = Champion & StatsTableRow;

export interface ChampionsStatsTableProps {
    rows: ChampionsStatsTableRow[];
    filter: CustomTableRowsFilter<ChampionsStatsTableRow>;
}

export function ChampionsStatsTable(props: ChampionsStatsTableProps) {

    const { rows, filter } = props;

    const [ sortDescriptor, setSortDescriptor ] = useState<SortDescriptor>({
        column: 'percentage',
        direction: CustomTableSortingDirection.DESCENDING_SORTING_DIRECTION,
    });

    const renderCell = useCallback((row: ChampionsStatsTableRow, columnKey: Key) => {
        if (columnKey === 'percentage') {
            return getPercentageString(row.percentage);
        }
        return undefined;
    }, []);

    return (
        <CustomTable<ChampionsStatsTableRow>
            rows={rows}
            columns={columns}
            tableRowKey={CHAMPION_ID_FIELD}
            customCellRenderer={renderCell}
            rowsFilter={filter}
            sortParams={{
                sortDescriptor: sortDescriptor,
                onSortChange: setSortDescriptor
            }}
        />
    );
}
