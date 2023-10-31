import { PlayerSearchResult, searchPlayers } from '@miguelteran/paladins-api-wrapper';
import { PlayersTable } from '../players-table';


export default async function SearchResultPage({ params } : { params: {searchTerm: string} }) {

    const playersSearchResult: PlayerSearchResult[] = await searchPlayers(params.searchTerm);
    const playersSortedById = playersSearchResult.sort((a, b) => Number(b.player_id) - Number(a.player_id)); // display 'newer' players first

    return (
        <PlayersTable
            playerSearchResults={playersSortedById}
        />
    );
}