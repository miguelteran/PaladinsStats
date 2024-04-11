'use client'

import { useState } from 'react';
import { Button, Input, Spinner } from '@nextui-org/react';
import { PlayerSearchResult } from '@miguelteran/paladins-api-wrapper';
import { PlayersTable } from './players-table';
import { getPlayerSearchResult } from '../actions';


export default function SearchPage() {

    const [ playerName, setPlayerName ] = useState<string>('');
    const [ playerSearchResult, setPlayerSearchResult ] = useState<PlayerSearchResult[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);

    const renderSearchBar = () => {
        return(
            <div id='search-bar-container' className='flex pb-4'>
                <Input
                    id='search-bar'
                    placeholder='Player Name'
                    value={playerName}
                    onValueChange={setPlayerName}
                    className='min-w-40 max-w-xs pr-2'
                />
                <Button
                    id='search-button'
                    onPress={search}
                >
                    Search
                </Button>
            </div>
        );
    };

    const renderPlayersTable = () => {
        if (isLoading) {
            return <Spinner/>;
        }
        if (!playerSearchResult || playerSearchResult.length === 0) {
            return undefined;
        }
        const playersSortedById = playerSearchResult.sort((a, b) => Number(b.player_id) - Number(a.player_id)); // display 'newer' players first
        return (
            <PlayersTable
                playerSearchResults={playersSortedById}
            />
        );
    }

    const search = () => {
        setIsLoading(true);
        getPlayerSearchResult(playerName)
            .then(searchResult => {
                setPlayerSearchResult(searchResult);
                setIsLoading(false);
            });
    }

    return (
        <div id='search-container'>
            {renderSearchBar()}
            <div id='players-table-container' className='flex min-h-dvh place-content-center'>
                {renderPlayersTable()}
            </div>
        </div>
    );
}