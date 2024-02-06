'use client'

import { useState } from 'react';
import { Button, Input, Spinner } from '@nextui-org/react';
import { PlayerSearchResult } from '@miguelteran/paladins-api-wrapper';
import { PlayersTable } from './players-table';


export default function SearchPage() {

    const [ playerName, setPlayerName ] = useState<string>('');
    const [ playerSearchResult, setPlayerSearchResult ] = useState<PlayerSearchResult[]>([]);
    const [ isLoading, setIsLoading ] = useState<boolean>(false);

    const renderSearchBar = () => {
        return(
            <div>
                <Input
                    placeholder='Player Name'
                    value={playerName}
                    onValueChange={setPlayerName}
                />
                <Button
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
        fetch(`http://${window.location.hostname}:${window.location.port}/api/search-players?playerName=` + playerName)
            .then(res => res.json())
            .then(searchResult => {
                setPlayerSearchResult(searchResult);
                setIsLoading(false);
            });
    }

    return (
        <div>
            {renderSearchBar()}
            {renderPlayersTable()}
        </div>
    );
}