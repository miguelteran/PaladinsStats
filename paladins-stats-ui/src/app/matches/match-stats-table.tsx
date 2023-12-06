'use client'

import { useState } from "react";
import { SortDescriptor } from "@nextui-org/react";
import { CustomTable, CustomTableColumn, CustomTableSortingDirection } from "@/components/table";
import { MatchDetails, PlayerMatchDetails } from "@miguelteran/paladins-api-wrapper";


const columns: CustomTableColumn[] = [
    { key: 'playerName', label: 'Player' },
    { key: 'Reference_Name', label: 'Champion' },
    { key: 'Win_Status', label: 'Result', sortable: true },
    { key: 'Kills_Player', label: 'Kills', sortable: true },
    { key: 'Deaths', label: 'Deaths', sortable: true },
    { key: 'Assists', label: 'Assists', sortable: true },
    { key: 'Gold_Earned', label: 'Credits', sortable: true },
    { key: 'Objective_Assists', label: 'Objective', sortable: true },
    { key: 'Damage_Player', label: 'Damage Done', sortable: true },
    { key: 'Damage_Taken', label: 'Damage Taken', sortable: true },
    { key: 'Healing', label: 'Healing', sortable: true },
    { key: 'Damage_Mitigated', label: 'Shielding', sortable: true }
];

export interface MatchStatsTableProps {
    matchDetails: MatchDetails;
}

export const MatchStatsTable = (props: MatchStatsTableProps) => {

    const [ sortDescriptor, setSortDescriptor ] = useState<SortDescriptor>({
        column: 'Win_Status',
        direction: CustomTableSortingDirection.DESCENDING_SORTING_DIRECTION
    });

    const { matchDetails } = props;

    return (
        <CustomTable<PlayerMatchDetails>
            rows={matchDetails.playerMatchDetails}
            columns={columns}
            tableRowKey='playerId'
            sortParams={{
                sortDescriptor: sortDescriptor,
                onSortChange: setSortDescriptor
            }}
        />
    );

}
