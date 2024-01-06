'use client'

import { Key, useCallback, useState } from "react";
import { SortDescriptor } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { Item } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/item";
import { ItemWithTooltip } from "@/components/item-with-tooltip";
import { StatsTableRow } from "@/models/stats-table-row";
import { getPercentageString } from "@/util/string-util";
import { ITEM_ID_FIELD } from "@/util/constants";
import { CustomTable, CustomTableColumn, CustomTableRowsFilter, CustomTableSortingDirection } from "../../components/table";


const columns: CustomTableColumn[] = [
    { key: 'DeviceName', label: 'Talent', sortable: true },
    { key: 'itemIcon_URL', label: '' },
    { key: 'Name', label: 'Champion', sortable: true },
    { key: 'percentage', label: 'Rate', sortable: true }
];

export type ItemsStatsTableRow = Item & Pick<Champion, 'Name' | 'Roles'> & StatsTableRow;

export interface ItemsStatsTableProps {
    rows: ItemsStatsTableRow[];
    filter: CustomTableRowsFilter<ItemsStatsTableRow>;
}

export function ItemsStatsTable(props: ItemsStatsTableProps) {

    const { rows, filter } = props;

    const [ sortDescriptor, setSortDescriptor ] = useState<SortDescriptor>({
        column: 'percentage',
        direction: CustomTableSortingDirection.DESCENDING_SORTING_DIRECTION,
    });

    const renderCell = useCallback((row: ItemsStatsTableRow, columnKey: Key) => {
        if (columnKey === 'percentage') {
            return getPercentageString(row.percentage);
        } else if (columnKey === 'itemIcon_URL') {
            return (
                <ItemWithTooltip 
                    key={row.ItemId} 
                    item={row}
                />
            );
        }
        return undefined;
    }, []);

    return (
        <CustomTable<ItemsStatsTableRow>
            rows={rows}
            columns={columns}
            tableRowKey={ITEM_ID_FIELD}
            customCellRenderer={renderCell}
            rowsFilter={filter}
            sortParams={{
                sortDescriptor: sortDescriptor,
                onSortChange: setSortDescriptor
            }}
        />
    );
}
