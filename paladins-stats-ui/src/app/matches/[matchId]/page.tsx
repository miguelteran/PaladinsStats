import { PlayerMatchDetails, getMatchDetails } from '@miguelteran/paladins-api-wrapper';
import { notFound } from 'next/navigation';
import { MatchStatsTable } from '../match-stats-table';
import { PlayerMatchCard } from '../player-match-card';
import { ChampionLoadoutsTable } from '../champion-loadouts-table';


export default async function MatchPage({ params }: { params: { matchId: string } }) {

    const matchDetails = await getMatchDetails(params.matchId);

    if (!matchDetails) {
        notFound();
    }

    const playerMatchDetails = matchDetails.playerMatchDetails;
    const winners = playerMatchDetails.filter(details => details.Win_Status === 'Winner');
    const losers = playerMatchDetails.filter(details => details.Win_Status === 'Loser');
    
    const renderPlayerCards = (playerDetails: PlayerMatchDetails[]) => {
        return (
            playerDetails.map((details, index) => {
                return (
                    <PlayerMatchCard
                        key={index}
                        playerMatchDetails={details}
                    />
                );
            })
        );
    };

    return (
        <div>
            <div>Match Id: {matchDetails.matchId}</div>
            <div>{matchDetails.matchTimestamp}</div>
            <div>{matchDetails.map}</div>
            <div>{matchDetails.region}</div>
            <div>{matchDetails.matchDuration}</div>

            <div>
                <div>{renderPlayerCards(winners)}</div>
                <div>{renderPlayerCards(losers)}</div>
            </div>

            <ChampionLoadoutsTable
                playerMatchDetails={playerMatchDetails}
            />

            <MatchStatsTable
                matchDetails={matchDetails}
            />
        </div>
    );
}
