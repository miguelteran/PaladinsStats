'use client'

import useSWRImmutable  from 'swr/immutable';
import { useState, useCallback, Key } from 'react';
import { User } from '@nextui-org/react';
import { CustomTable, CustomTableColumn, CustomTableLoadingState } from '@/components/table';
import { Player, PlayerSearchResult } from '@miguelteran/paladins-api-wrapper';
import { useRouter } from 'next/navigation';
import { getPlayers } from '../actions';


const ROWS_PER_PAGE = 5;

const columns: CustomTableColumn[] = [
    { key: 'Name', label: 'IGN' },
    { key: 'Level', label: 'Level' },
    { key: 'Region', label: 'Region' }
]

export interface PlayersTableProps {
    playerSearchResults: PlayerSearchResult[]
}

export const PlayersTable = (props: PlayersTableProps) => {

    const [ page, setPage ] = useState(1);

    const router = useRouter();

    const { playerSearchResults } = props;

    // Get number of pages for table
    const numPages = Math.ceil(playerSearchResults.length / ROWS_PER_PAGE);

    // Get playerIds for active page
    const start = (page - 1) * ROWS_PER_PAGE;
    const end = start + ROWS_PER_PAGE;
    const playerIds: string[] = playerSearchResults.slice(start, end).map(playerSearchResult => playerSearchResult.player_id);

    // Get player information for group of ids
    const { data, isLoading } = useSWRImmutable(playerIds, playerIds => getPlayers(playerIds));
    const players: Player[] = data ?? [];
    const loadingState = isLoading || data?.length === 0 ? CustomTableLoadingState.LOADING : CustomTableLoadingState.IDLE;

    const renderCell = useCallback((player: Player, columnKey: Key) => {
        if (columnKey === 'Name') {
            return (
                <User
                    name={player.Name}
                    avatarProps={{
                        src: player.AvatarURL,
                        showFallback: true,
                        fallback: <img src='paladins-logo.jpg'/>
                    }}
                />
            );
        } else {
            return undefined;
        }
    }, []);

    const onRowClick = (key: Key) => { router.push(`/players/${key}`); }

    return (
        <CustomTable<Player>
            rows={players}
            columns={columns}
            tableRowKey='Id'
            customCellRenderer={renderCell}
            onRowClick={onRowClick}
            loadingState={loadingState}
            paginationParams={{
                activePage: page,
                numPages: numPages,
                onPageChange: setPage
            }}
        />
    );
}