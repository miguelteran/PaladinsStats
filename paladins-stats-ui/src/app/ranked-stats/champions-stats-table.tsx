'use client'

import { Key } from "react";
import { Selection } from "@nextui-org/react";
import { Champion } from "@miguelteran/paladins-api-wrapper/dist/src/interfaces/champion";
import { CustomTableColumn } from "../../components/table";
import { CountRequest, StatsTable, StatsTableRow } from "./stats-table";
import champions from '../../../public/champions.json';


const ROWS_PER_PAGE = 15;

const columns: CustomTableColumn[] = [
    { key: 'Name', label: 'Champion', sortable: true },
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
        />
    );
}
