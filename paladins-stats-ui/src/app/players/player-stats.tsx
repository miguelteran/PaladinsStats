'use client'

import { Key, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { RecentMatch } from '@miguelteran/paladins-api-wrapper';
import { Tab, Tabs } from '@nextui-org/tabs';
import { SortDescriptor, Selection } from '@nextui-org/react';
import { CustomTable, CustomTableColumn, CustomTableSortingDirection } from '@/components/table';
import { RolesSelect } from '@/components/roles-select';
import { ChampionStatsSummary } from '@/models/champion-stats-summary';
import { getPercentageString, getTimeString } from '@/util/string-util';


const matchesTableColumns: CustomTableColumn[] = [
    { key: 'Champion', label: 'Champion' },
    { key: 'Map_Game', label: 'Mode' },
    { key: 'Win_Status', label: 'Result' },
    { key: 'KDA', label: 'KDA' },
    { key: 'Match_Time', label: 'Date' }
];

const championsTableColumns: CustomTableColumn[] = [
    { key: 'championName', label: 'Champion', sortable: true },
    { key: 'rank', label: 'Level', sortable: true },
    { key: 'numberOfMatches', label: 'Total Matches', sortable: true },
    { key: 'winRate', label: 'Win Rate', sortable: true },
    { key: 'kdaRatio', label: 'KDA', sortable: true },
    { key: 'minutesPlayed', label: 'Time Played', sortable: true }
]

export const PlayerStats = ({recentMatches, championStats}: {recentMatches: RecentMatch[], championStats: ChampionStatsSummary[]}) => {

    const [ championsSortDescriptor, setChampionsSortDescriptor ] = useState<SortDescriptor>({
        column: 'champion',
        direction: CustomTableSortingDirection.ASCENDING_SORTING_DIRECTION,
    });
    const [ selectedRoles, setSelectedRoles ] = useState<Selection>(new Set([]));

    const router = useRouter();

    const renderMatchesCell = useCallback((match: RecentMatch, columnKey: Key) => {
        if (columnKey === 'KDA') {
            return `${match.Kills}/${match.Deaths}/${match.Assists}`;
        } else {
            return undefined;
        }
    }, []);

    const renderChampionsCell = useCallback((champion: ChampionStatsSummary, columnKey: Key) => {
        switch (columnKey) {
            case 'winRate':
                return getPercentageString(champion.winRate);
            case 'kdaRatio':
                return `${champion.kda} (${champion.kdaRatio.toFixed(2)})`;
            case 'minutesPlayed':
                return getTimeString(champion.minutesPlayed);
            default:
                return undefined;
        }
    }, []);

    const championStatsFilter = (champion: ChampionStatsSummary) => {
        return selectedRoles === 'all' || selectedRoles.size === 0 || (selectedRoles.has(champion.championRole));
    }

    const onMatchClick = (key: Key) => { router.push(`/matches/${key}`); }

    return (
        <div>
            <RolesSelect
                selectedRoles={selectedRoles}
                onSelectedRolesChange={setSelectedRoles}
            />
            <Tabs>
                <Tab key='recentMatches' title='Recent Matches'>
                    <CustomTable<RecentMatch>
                        columns={matchesTableColumns}
                        rows={recentMatches}
                        tableRowKey='Match'
                        customCellRenderer={renderMatchesCell}
                        onRowClick={onMatchClick}
                    />
                </Tab>
                <Tab key='championStats' title='Champion Stats'>
                    <CustomTable<ChampionStatsSummary>
                        columns={championsTableColumns}
                        rows={championStats}
                        tableRowKey='championId'
                        rowsFilter={championStatsFilter}
                        customCellRenderer={renderChampionsCell}
                        sortParams={{
                            sortDescriptor: championsSortDescriptor, 
                            onSortChange: setChampionsSortDescriptor
                        }}
                    />
                </Tab>
            </Tabs>
        </div>
    );
}
