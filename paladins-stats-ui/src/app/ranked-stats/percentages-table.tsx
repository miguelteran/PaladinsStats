'use client'

import { Key, useCallback, useState } from "react";
import { SortDescriptor } from "@nextui-org/react";
import { CountResult } from "@miguelteran/paladins-stats-db/dist/src/models/aggregations/count-result";
import { CustomTable, CustomTableColumn, CustomTableRowsFilter, CustomTableSortingDirection } from "../../components/table";
import { getPercentageString } from "@/util/string-util";
import { getPercentage } from "@/util/number-util";
import { PaladinsRoles } from "@/models/role";


export interface PercentagesTableProps<T> {
    totalCounts: CountResult[];
    partialCounts: CountResult[];
    entries: T[];
    entryId: string;
    getPercentagesTableRow: (entry: T) => PercentagesTableRow;
    columns: CustomTableColumn[];
    filter: CustomTableRowsFilter<PercentagesTableRow>;
}

export interface PercentagesTableRow {
    id: number;
    championName: string;
    championId?: number;
    talentName?: string;
    role: PaladinsRoles;
    percentage: number;
}

export function PercentagesTable<T>(props: PercentagesTableProps<T>) {

    const { totalCounts, partialCounts, entries, entryId, columns, getPercentagesTableRow, filter } = props;

    const [ sortDescriptor, setSortDescriptor ] = useState<SortDescriptor>({
        column: 'percentage',
        direction: CustomTableSortingDirection.DESCENDING_SORTING_DIRECTION,
    });

    const renderCell = useCallback((row: PercentagesTableRow, columnKey: Key) => {
        if (columnKey === 'percentage') {
            return getPercentageString(row.percentage);
        }
        return undefined;
    }, []);

    const rows = entries.map(e => {
        const row = getPercentagesTableRow(e);
        const totalCount = totalCounts.length === 1 ? totalCounts[0] : totalCounts.find(matchCount => matchCount.id === e[entryId as keyof T]);
        const partialCount = partialCounts.find(matchCount => matchCount.id === e[entryId as keyof T]);
        const percentage = totalCount && totalCount.count !== 0 ? getPercentage(totalCount.count, partialCount ? partialCount.count : 0) : 0;
        row.percentage = percentage;
        return row;
    });

    return (
        <CustomTable<PercentagesTableRow>
            rows={rows}
            columns={columns}
            tableRowKey='id'
            customCellRenderer={renderCell}
            rowsFilter={filter}
            sortParams={{
                sortDescriptor: sortDescriptor,
                onSortChange: setSortDescriptor
            }}
        />
    );
}
