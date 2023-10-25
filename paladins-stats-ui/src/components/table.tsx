'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from '@nextui-org/table';
import { SortDescriptor } from '@nextui-org/react';
import { Key, useCallback, useMemo } from 'react';


export interface CustomTableProps<T> {
    columns: CustomTableColumn[],
    rows: T[],
    tableRowKey: string,
    customCellRenderer?: (item: T, columnKey: Key) => any,
    sortDescriptor?: SortDescriptor,
    onSortChange?: (sortDescriptor: SortDescriptor) => void,
}

export interface CustomTableColumn {
    key: string,
    label: string,
    sortable?: boolean
}

export function CustomTable<T>(props: CustomTableProps<T>) {

    const sortedRows = useMemo(() => {
        if (!props.sortDescriptor) {
            return props.rows;
        }
        return [...props.rows].sort((a: T, b: T) => {
            const first = a[props.sortDescriptor!.column as keyof T] as number;
            const second = b[props.sortDescriptor!.column as keyof T] as number;
            const cmp = first < second ? -1 : first > second ? 1 : 0;
            return props.sortDescriptor!.direction === 'descending' ? -cmp : cmp;
        });
    }, [props.sortDescriptor, props.rows]);

    const renderCell = useCallback((item: T, columnKey: Key) => {
        let cellContent = undefined;
        if (props.customCellRenderer) {
            cellContent = props.customCellRenderer(item, columnKey);
        } 
        return cellContent !== undefined ? cellContent : getKeyValue(item, columnKey);
    }, []);

    return (
        <Table
            isHeaderSticky
            sortDescriptor={props.sortDescriptor}
            onSortChange={props.onSortChange}
        >
            <TableHeader columns={props.columns}>
                {(column) => 
                    <TableColumn key={column.key} allowsSorting={column.sortable}>
                        {column.label}
                    </TableColumn>
                }
            </TableHeader>
            <TableBody<T> items={sortedRows}>
                {(item) => (
                    <TableRow key={getKeyValue(item, props.tableRowKey)}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
