'use client'

import { Key, useState, useCallback } from 'react';
import { SortDescriptor, Selection } from '@nextui-org/react';
import { CustomTable, CustomTableColumn, CustomTableSortingDirection } from '@/components/table';
import { RolesSelect } from '@/components/roles-select';
import { ChampionStatsSummary } from '@/models/champion-stats-summary';
import { getPercentageString, getTimeString } from '@/util/string-util';


const ROWS_PER_PAGE = 10;

const columns: CustomTableColumn[] = [
    { key: 'championName', label: 'Champion', sortable: true },
    { key: 'rank', label: 'Level', sortable: true },
    { key: 'numberOfMatches', label: 'Total Matches', sortable: true },
    { key: 'winRate', label: 'Win Rate', sortable: true },
    { key: 'kdaRatio', label: 'KDA', sortable: true },
    { key: 'minutesPlayed', label: 'Time Played', sortable: true }
]

export function PlayerChampionStatsTable({championStats}: {championStats: ChampionStatsSummary[]}) {

    const [ championsSortDescriptor, setChampionsSortDescriptor ] = useState<SortDescriptor>({
        column: 'champion',
        direction: CustomTableSortingDirection.ASCENDING_SORTING_DIRECTION,
    });
    const [ selectedRoles, setSelectedRoles ] = useState<Selection>(new Set([]));
    const [ page, setPage ] = useState(1);

    const renderCell = useCallback((champion: ChampionStatsSummary, columnKey: Key) => {
        switch (columnKey) {
            case 'winRate':
                return getPercentageString(champion.winRate);
            case 'kdaRatio':
                return `${champion.kda} (${champion.kdaRatio.toFixed(2)})`;
            case 'minutesPlayed':
                return getTimeString(champion.minutesPlayed, 'minutes');
            default:
                return undefined;
        }
    }, []);

    const championStatsFilter = (champion: ChampionStatsSummary) => {
        return selectedRoles === 'all' || selectedRoles.size === 0 || (selectedRoles.has(champion.championRole));
    }

    return (
        <div id='player-champion-stats-container'>
            <RolesSelect
                selectedRoles={selectedRoles}
                onSelectedRolesChange={setSelectedRoles}
            />
            <CustomTable<ChampionStatsSummary>
                columns={columns}
                rows={championStats}
                tableRowKey='championId'
                rowsFilter={championStatsFilter}
                customCellRenderer={renderCell}
                sortParams={{
                    sortDescriptor: championsSortDescriptor, 
                    onSortChange: setChampionsSortDescriptor
                }}
                paginationParams={{
                    activePage: page,
                    onPageChange: setPage,
                    rowsPerPage: ROWS_PER_PAGE
                }}
            />
        </div>
    );
}
