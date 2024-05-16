'use client'

import useSWRImmutable from "swr/immutable";
import { Key, useCallback, useState } from "react";
import { SortDescriptor, Spinner } from "@nextui-org/react";
import { CountFilter } from "@/models/count-filter";
import { CountResult } from "@/models/count-result";
import { getPercentageString } from "@/util/string-util";
import { getPercentage } from "@/util/number-util";
import { StatsCategory } from "@/models/stats-category";
import { CustomTable, CustomTableCellRenderer, CustomTableColumn, CustomTableRowsFilter, CustomTableSortingDirection } from "../../components/table";
import { getCountResults } from "../actions";


export type StatsTableRow<T> = T & CountResult & { percentage: number };

export interface CountRequest {
    statsCategory: StatsCategory;
    filter: CountFilter;
}

export interface StatsTableProps<T> {
    request: CountRequest;
    objects: T[];
    idField: string;
    columns: CustomTableColumn[];
    cellRenderer?: CustomTableCellRenderer<StatsTableRow<T>>;
    rowsFilter: CustomTableRowsFilter<StatsTableRow<T>>;
    rowsPerPage?: number;
}

export function StatsTable<T>(props: StatsTableProps<T>) {

    const { request, objects, idField, columns, rowsPerPage, cellRenderer, rowsFilter } = props;

    const [ sortDescriptor, setSortDescriptor ] = useState<SortDescriptor>({
        column: 'percentage',
        direction: CustomTableSortingDirection.DESCENDING_SORTING_DIRECTION,
    });

    const [ page, setPage ] = useState(1);

    const paginationParams = !rowsPerPage ? undefined : {
        activePage: page,
        onPageChange: setPage,
        rowsPerPage: rowsPerPage
    } 

    const renderCell = useCallback((row: StatsTableRow<T>, columnKey: Key) => {
        if (columnKey === 'percentage') {
            return getPercentageString(row.percentage);
        } else if (cellRenderer){
            return cellRenderer(row, columnKey)
        } else {
            return undefined;
        }
    }, [cellRenderer]);

    const getRows = (countResults: CountResult[]) => {
        return objects.map((o: any) => {
            const result = countResults.find(r => r.id === o[idField]);
            return {
                ...o,
                ...result,
                percentage: result ? getPercentage(result.total, result.partial) : 0
            };
        });
    };

    const response = useSWRImmutable(request, request => getCountResults(request.statsCategory, request.filter));

    if (response.isLoading) {
        return <Spinner/>;
    }

    return (
        <CustomTable<StatsTableRow<T>>
            rows={getRows(response.data ?? [])}
            columns={columns}
            tableRowKey={idField}
            customCellRenderer={renderCell}
            rowsFilter={rowsFilter}
            sortParams={{
                sortDescriptor: sortDescriptor,
                onSortChange: setSortDescriptor
            }}
            paginationParams={paginationParams}
        />
    );
}
