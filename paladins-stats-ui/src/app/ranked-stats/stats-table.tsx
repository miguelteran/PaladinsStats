'use client'

import useSWRImmutable from "swr/immutable";
import { Key, useCallback, useState } from "react";
import { SortDescriptor, Spinner } from "@nextui-org/react";
import { CountFilter } from "@miguelteran/paladins-stats-db/dist/src/models/filter/count-filter";
import { CountResult } from "@miguelteran/paladins-stats-db/dist/src/models/aggregations/count-result";
import { getPercentageString } from "@/util/string-util";
import { getPercentage } from "@/util/number-util";
import { CustomTable, CustomTableCellRenderer, CustomTableColumn, CustomTableRowsFilter, CustomTableSortingDirection } from "../../components/table";


function useCountRequest(request: CountRequest) {
    return useSWRImmutable(request, (request) => {
        return fetch(`http://${window.location.hostname}:${window.location.port}/api/${request.uri}`, {
            method: 'POST',
            body: JSON.stringify(request.filter)
        }).then(res => res.json());
    });
};

export type StatsTableRow<T> = T & { percentage: number };

export interface CountRequest {
    uri: string;
    filter: CountFilter;
}

export interface StatsTableProps<T> {
    totalCountRequest: CountRequest;
    partialCountRequest: CountRequest;
    objects: T[];
    idField: string;
    columns: CustomTableColumn[];
    cellRenderer?: CustomTableCellRenderer<StatsTableRow<T>>;
    rowsFilter: CustomTableRowsFilter<StatsTableRow<T>>;
}

export function StatsTable<T>(props: StatsTableProps<T>) {

    const { totalCountRequest, partialCountRequest, objects, idField, columns, cellRenderer, rowsFilter } = props;

    const [ sortDescriptor, setSortDescriptor ] = useState<SortDescriptor>({
        column: 'percentage',
        direction: CustomTableSortingDirection.DESCENDING_SORTING_DIRECTION,
    });

    const renderCell = useCallback((row: StatsTableRow<T>, columnKey: Key) => {
        if (columnKey === 'percentage') {
            return getPercentageString(row.percentage);
        } else if (cellRenderer){
            return cellRenderer(row, columnKey)
        } else {
            return undefined;
        }
    }, [cellRenderer]);

    const getPercentageForEntry = (entry: any, totalCounts: CountResult[], partialCounts: CountResult[]): number => {
        const totalCount = totalCounts.length === 1 ? totalCounts[0] : totalCounts.find(count => count.id === entry[idField]);
        const partialCount = partialCounts.find(count => count.id === entry[idField]);
        return totalCount && totalCount.count !== 0 ? getPercentage(totalCount.count, partialCount ? partialCount.count : 0) : 0;
    };

    const getRows = (totalCounts: CountResult[], partialCounts: CountResult[]) => {
        return objects.map(o => {
            return {
                ...o,
                percentage: getPercentageForEntry(o, totalCounts, partialCounts)
            };
        });
    };

    const totalCountResponse = useCountRequest(totalCountRequest);
    const partialCountResponse = useCountRequest(partialCountRequest);

    if (totalCountResponse.isLoading || partialCountResponse.isLoading) {
        return <Spinner/>;
    }

    return (
        <CustomTable<StatsTableRow<T>>
            rows={getRows(totalCountResponse.data ?? [], partialCountResponse.data ?? [])}
            columns={columns}
            tableRowKey={idField}
            customCellRenderer={renderCell}
            rowsFilter={rowsFilter}
            sortParams={{
                sortDescriptor: sortDescriptor,
                onSortChange: setSortDescriptor
            }}
        />
    );
}
