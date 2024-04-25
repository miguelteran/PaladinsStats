'use client'

import useSWRImmutable from "swr/immutable";
import { Key, useCallback, useState } from "react";
import { Spinner } from "@nextui-org/react";
import { Item } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/item";
import { CountFilter } from "@miguelteran/paladins-stats-db/dist/src/models/count-filter";
import { ItemsAggregrationResult } from "@miguelteran/paladins-stats-db/dist/src/models/aggregations/items-aggregation-result";
import { ImageWithTooltip } from "@/components/image-with-tooltip";
import { RANKED_STATS_TABLE_COLUMN_WIDTH } from "@/util/constants";
import { CustomTable, CustomTableColumn } from "../../components/table";
import { getItemPicks } from "../actions";
import items from '../../../public/items.json';


const ROWS_PER_PAGE = 5;

const columns: CustomTableColumn[] = [
    { key: 'DeviceName', label: 'Item', width: RANKED_STATS_TABLE_COLUMN_WIDTH },
    { key: 'itemIcon_URL', label: '' }
];

type ItemsStatsTableRow = Item & { count: number };

export interface ItemsStatsTableProps {
    filter: CountFilter;
}

export function ItemsStatsTable(props: ItemsStatsTableProps) {

    const { filter } = props;

    const [ page, setPage ] = useState(1);

    const response = useSWRImmutable(filter, (filter: CountFilter) => getItemPicks(filter));

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

    const results: ItemsAggregrationResult[] = response.data ?? [];
    const rows: ItemsStatsTableRow[] = items.map(item => {
        const countResult = results.find(r => r.itemId === item.ItemId);
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
            paginationParams={{
                activePage: page,
                onPageChange: setPage,
                rowsPerPage: ROWS_PER_PAGE
            } }
        />
    );
}
