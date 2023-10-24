'use client'

import { Key, useState, useCallback } from 'react';
import { ChampionStats, RecentMatch } from '@miguelteran/paladins-api-wrapper';
import { CustomTable, CustomTableColumn } from '@/components/table';
import { Tab, Tabs } from '@nextui-org/tabs';
import { SortDescriptor } from '@nextui-org/react';
import { getPercentageString, getTimeString } from '@/util/string-util';


export const PlayerStats = ({recentMatches, championStats}: {recentMatches: RecentMatch[], championStats: ChampionStats[]}) => {

    const [championsSortDescriptor, setChampionsSortDescriptor] = useState<SortDescriptor>({
        column: 'champion',
        direction: 'ascending',
    });

    const matchesTableColumns: CustomTableColumn[] = [
        {key: 'Champion', label: 'Champion'},
        {key: 'Map_Game', label: 'Mode'},
        {key: 'Win_Status', label: 'Result'},
        {key: 'KDA', label: 'KDA'},
        {key: 'Match_Time', label: 'Date'}
    ];

    const championsTableColumns: CustomTableColumn[] = [
        {key: 'champion', label: 'Champion', sortable: true},
        {key: 'Rank', label: 'Level', sortable: true},
        {key: 'NumberOfMatches', label: 'Total Matches'},
        {key: 'WinRate', label: 'Win Rate'},
        {key: 'KDA', label: 'KDA'},
        {key: 'TimePlayed', label: 'Time Played'}
    ]

    const renderMatchesCell = useCallback((match: RecentMatch, columnKey: Key) => {
        if (columnKey === 'KDA') {
            return `${match.Kills}/${match.Deaths}/${match.Assists}`;
        } else {
            return undefined;
        }
    }, []);

    const renderChampionsCell = useCallback((champion: ChampionStats, columnKey: Key) => {
        switch (columnKey) {
            case 'NumberOfMatches':
                return champion.Wins + champion.Losses;
            case 'WinRate':
                const numMatches = champion.Wins + champion.Losses;
                return getPercentageString(numMatches, champion.Wins);
            case 'KDA':
                return `${champion.Kills}/${champion.Deaths}/${champion.Assists}`;
            case 'TimePlayed':
                return getTimeString(champion.Minutes);
            default:
                return undefined;
        }
    }, []);

    return (
        <Tabs>
            <Tab key='recentMatches' title='Recent Matches'>
                <CustomTable<RecentMatch>
                    columns={matchesTableColumns}
                    rows={recentMatches}
                    tableRowKey='Match'
                    customCellRenderer={renderMatchesCell}
                />
            </Tab>
            <Tab key='championStats' title='Champion Stats'>
                <CustomTable<ChampionStats>
                    columns={championsTableColumns}
                    rows={championStats}
                    tableRowKey='champion_id'
                    customCellRenderer={renderChampionsCell}
                    sortDescriptor={championsSortDescriptor}
                    onSortChange={setChampionsSortDescriptor}
                />
            </Tab>
        </Tabs>
    );
}
