'use client'

import useSWRImmutable from "swr/immutable";
import { Key, useCallback } from "react";
import { Spinner } from "@nextui-org/react";
import { Item } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/item";
import { CountFilter } from "@miguelteran/paladins-stats-db/dist/src/models/filter/count-filter";
import { CountResult } from "@miguelteran/paladins-stats-db/dist/src/models/aggregations/count-result";
import { ImageWithTooltip } from "@/components/image-with-tooltip";
import { CustomTable, CustomTableColumn } from "../../components/table";
import items from '../../../public/items.json';


const columns: CustomTableColumn[] = [
    { key: 'DeviceName', label: 'Item' },
    { key: 'itemIcon_URL', label: '' }
];

type ItemsStatsTableRow = Item & CountResult;

export interface ItemsStatsTableProps {
    filter: CountFilter;
}

export function ItemsStatsTable(props: ItemsStatsTableProps) {

    const { filter } = props;

    const response = useSWRImmutable(filter, (filter: CountFilter) => 
        fetch(`http://${window.location.hostname}:${window.location.port}/api/items-count`, {
            method: 'POST',
            body: JSON.stringify(filter)
        }).then(res => res.json())
    );

    const renderCell = useCallback((row: ItemsStatsTableRow, columnKey: Key) => {
        if (columnKey === 'itemIcon_URL') {
            return (
                <ImageWithTooltip 
                    key={row.ItemId} 
                    content={row.Description}
                    imageUrl={row.itemIcon_URL}
                />
            );
        }
        return undefined;
    }, []);

    if (response.isLoading) {
        return <Spinner/>
    }

    const counts: CountResult[] = response.data ?? [];
    const rows: ItemsStatsTableRow[] = items.map(item => {
        const countResult = counts.find(c => c.id === item.ItemId);
        return {
            ...item,
            count: countResult ? countResult.count : 0
        };
    }).sort((a, b) => b.count - a.count);

    return (
        <CustomTable<ItemsStatsTableRow>
            rows={rows}
            columns={columns}
            tableRowKey='ItemId'
            customCellRenderer={renderCell}
        />
    );
}
