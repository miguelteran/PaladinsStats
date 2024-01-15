'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from '@nextui-org/table';
import { Spinner, Pagination, SortDescriptor } from '@nextui-org/react';
import { Key, useCallback, useMemo } from 'react';


export enum CustomTableSortingDirection {
    ASCENDING_SORTING_DIRECTION = 'ascending',
    DESCENDING_SORTING_DIRECTION = 'descending'
}

export enum CustomTableLoadingState {
    LOADING = 'loading',
    IDLE = 'idle'
}

type LoadingState = 'loading' | 'sorting' | 'loadingMore' | 'error' | 'idle' | 'filtering'
export type CustomTableCellRenderer<T> = (item: T, columnKey: Key) => any;
export type CustomTableRowsFilter<T> = (row: T) => boolean;

export interface CustomTableProps<T> {
    columns: CustomTableColumn[],
    rows: T[],
    tableRowKey: string,
    customCellRenderer?: CustomTableCellRenderer<T>,
    onRowClick?: (key: Key) => void; 
    loadingState?: LoadingState,
    sortParams?: CustomTableSortParams
    paginationParams?: CustomTablePaginationParams,
    rowsFilter?: CustomTableRowsFilter<T>;
}

export interface CustomTableColumn {
    key: string,
    label: string,
    sortable?: boolean
}

export interface CustomTableSortParams {
    sortDescriptor: SortDescriptor,
    onSortChange: (sortDescriptor: SortDescriptor) => void,
}

export interface CustomTablePaginationParams {
    numPages: number;
    activePage: number;
    onPageChange: (activePage: number) => void;
}

export function CustomTable<T>(props: CustomTableProps<T>) {

    const { columns, rows, tableRowKey, sortParams, paginationParams, loadingState, rowsFilter, customCellRenderer, onRowClick } = props;

    const filteredRows = useMemo(() => {
        if (!rowsFilter) {
            return rows;
        }
        return rows.filter(rowsFilter);
    }, [rowsFilter, rows]);

    const sortedRows = useMemo(() => {
        if (!sortParams) {
            return filteredRows;
        }
        const { sortDescriptor } = sortParams;
        return filteredRows.sort((a: T, b: T) => {
            const first = a[sortDescriptor.column as keyof T] as number;
            const second = b[sortDescriptor.column as keyof T] as number;
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return sortDescriptor.direction === CustomTableSortingDirection.DESCENDING_SORTING_DIRECTION ? -cmp : cmp;
        });
    }, [sortParams, filteredRows]);

    const renderCell = useCallback((item: T, columnKey: Key) => {
        let cellContent = undefined;
        if (customCellRenderer) {
            cellContent = customCellRenderer(item, columnKey);
        } 
        return cellContent !== undefined ? cellContent : getKeyValue(item, columnKey);
    }, [customCellRenderer]);

    const getPagination = () => {
        if (!paginationParams) {
            return undefined;
        }
        const { activePage, numPages, onPageChange } = paginationParams;
        if (numPages > 0) {
            return (
                <div className='flex w-full justify-center'>
                    <Pagination
                        isCompact
                        showControls
                        showShadow
                        color='secondary'
                        page={activePage}
                        total={numPages}
                        onChange={onPageChange}
                    />
                </div>
            );
        } else {
            return undefined;
        }
    }

    return (
        <Table
            isHeaderSticky
            selectionMode='single'
            sortDescriptor={sortParams && sortParams.sortDescriptor}
            onSortChange={sortParams && sortParams.onSortChange}
            onRowAction={onRowClick}
            bottomContent={getPagination()}
        >
            <TableHeader columns={columns}>
                {(column) => 
                    <TableColumn key={column.key} allowsSorting={column.sortable}>
                        {column.label}
                    </TableColumn>
                }
            </TableHeader>
            <TableBody<T> 
                items={sortedRows}
                loadingContent={<Spinner/>}
                loadingState={loadingState}
            >
                {(item) => (
                    <TableRow key={getKeyValue(item, tableRowKey)}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
