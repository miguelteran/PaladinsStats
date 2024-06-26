'use client'

import { Key, useCallback } from "react";
import { Selection } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { RANKED_STATS_TABLE_COLUMN_WIDTH } from "@/util/constants";
import { CustomTableColumn } from "../../components/table";
import { CountRequest, StatsTable, StatsTableRow } from "./stats-table";
import champions from '../../../public/champions.json';


const ROWS_PER_PAGE = 6;

const columns: CustomTableColumn[] = [
    { key: 'Name', label: 'Champion', sortable: true, width: RANKED_STATS_TABLE_COLUMN_WIDTH },
    { key: 'ChampionIcon_URL', label: '', width: RANKED_STATS_TABLE_COLUMN_WIDTH },
    { key: 'percentage', label: 'Rate', sortable: true },
    // for debugging
    // { key: 'partial', label: 'Partial'},
    // { key: 'total', label: 'Total'},
];

export interface ChampionsStatsTableProps {
    request: CountRequest;
    selectedRole: Selection; 
}

export function ChampionsStatsTable(props: ChampionsStatsTableProps) {

    const { request, selectedRole } = props;

    const renderCell = useCallback((row: StatsTableRow<Champion>, columnKey: Key) => {
        if (columnKey === 'ChampionIcon_URL') {
            return (
                <div className='min-w-16 max-w-24'>
                    <ImageWithFallback 
                        src={row.ChampionIcon_URL}
                        alt='champion'
                        fallback='/paladins-logo.jpg'
                        height={90}
                        width={90}
                    />
                </div>
            );
        }
        return undefined;
    }, []);

    const rowsFilter = (row: StatsTableRow<Champion>) => {
        const roles = Array.from(selectedRole as Set<Key>);
        return roles.length === 0 || roles.findIndex(r => r === row.Roles) !== -1;
    }

    return (
        <StatsTable<Champion>
            request={request}
            objects={champions}
            idField='id'
            columns={columns}
            rowsFilter={rowsFilter}
            rowsPerPage={ROWS_PER_PAGE}
            cellRenderer={renderCell}
        />
    );
}
