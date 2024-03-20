'use client'

import { Key, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RecentMatch } from '@miguelteran/paladins-api-wrapper';
import { CustomTable, CustomTableColumn } from '@/components/table';


const ROWS_PER_PAGE = 10;

const columns: CustomTableColumn[] = [
    { key: 'Champion', label: 'Champion' },
    { key: 'Map_Game', label: 'Mode' },
    { key: 'Win_Status', label: 'Result' },
    { key: 'KDA', label: 'KDA' },
    { key: 'Match_Time', label: 'Date' }
];

export function RecentMatchesTable({recentMatches}: {recentMatches: RecentMatch[]}) {

    const [ page, setPage ] = useState(1);

    const router = useRouter();

    const renderCell = useCallback((match: RecentMatch, columnKey: Key) => {
        if (columnKey === 'KDA') {
            return `${match.Kills}/${match.Deaths}/${match.Assists}`;
        } else {
            return undefined;
        }
    }, []);

    const onRowClick = (key: Key) => { router.push(`/matches/${key}`); }

    return (
        <CustomTable<RecentMatch>
            columns={columns}
            rows={recentMatches}
            tableRowKey='Match'
            customCellRenderer={renderCell}
            onRowClick={onRowClick}
            paginationParams={{
                activePage: page,
                onPageChange: setPage,
                rowsPerPage: ROWS_PER_PAGE
            }}
        /> 
    );
}
