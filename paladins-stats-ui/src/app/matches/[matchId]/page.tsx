import { PlayerMatchDetails, getMatchDetails } from '@miguelteran/paladins-api-wrapper';
import { notFound } from 'next/navigation';
import { MatchStatsTable } from '../match-stats-table';
import { PlayerMatchCard } from '../player-match-card';
import { ChampionLoadoutsTable } from '../champion-loadouts-table';
import { TextWithLabel } from '@/components/text-with-label';


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
                    <div id={`player-match-card-container-${details.playerId}`} className='py-1' key={index}>
                        <PlayerMatchCard
                            key={index}
                            playerMatchDetails={details}
                        />
                    </div>
                );
            })
        );
    };

    return (
        <div>
            <div id='match-info-container' className='pb-4'>
                <TextWithLabel label='ID' value={matchDetails.matchId}/>
                <TextWithLabel label='Date' value={matchDetails.matchTimestamp}/>
                <TextWithLabel label='Mode' value={matchDetails.map}/>
                <TextWithLabel label='Region' value={matchDetails.region}/>
                <TextWithLabel label='Duration' value={matchDetails.matchDuration}/>
            </div>

            <div className='columns-2 pb-4'>
                <div className='flex-col'>
                    {renderPlayerCards(winners)}
                </div>
                <div className='flex-col'>
                    {renderPlayerCards(losers)}
                </div>
            </div>

            <div id='champion-loadouts-table-container' className='pb-4'>
                <ChampionLoadoutsTable
                    playerMatchDetails={playerMatchDetails}
                />
            </div>

            <div id='match-stats-table-container'>
                <MatchStatsTable
                    matchDetails={matchDetails}
                />
            </div>
        </div>
    );
}
