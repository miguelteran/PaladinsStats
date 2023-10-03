// 'use client'

import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, getKeyValue } from '@nextui-org/table';
import { Key, useCallback } from 'react';


export interface CustomTableColumn {
    key: string,
    label: string
}

export function CustomTable<T>({columns, rows, tableRowKey, customCellRenderer}: {columns: CustomTableColumn[], rows: T[], tableRowKey: string, customCellRenderer?: (item: T, columnKey: Key) => any}) {

    const renderCell = useCallback((item: T, columnKey: Key) => {
        let cellContent = undefined;
        if (customCellRenderer) {
            cellContent = customCellRenderer(item, columnKey);
        } 
        return cellContent !== undefined ? cellContent : getKeyValue(item, columnKey);
    }, []);

    return (
        <Table>
            <TableHeader columns={columns}>
                {(column) => <TableColumn key={column.key}>{column.label}</TableColumn>}
            </TableHeader>
            <TableBody<T> items={rows}>
                {(item) => (
                    <TableRow key={getKeyValue(item, tableRowKey)}>
                        {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </Table>
    );
}
