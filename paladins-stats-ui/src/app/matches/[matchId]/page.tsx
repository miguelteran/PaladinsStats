import { notFound } from 'next/navigation';
import { PlayerMatchDetails, getMatchDetails } from '@miguelteran/paladins-api-wrapper';
import { TextWithLabel } from '@/components/text-with-label';
import { getTimeString } from '@/util/string-util';
import { MatchStatsTable } from '../match-stats-table';
import { PlayerMatchCard, PlayerParties } from '../player-match-card';
import { ChampionLoadoutsTable } from '../champion-loadouts-table';


export default async function MatchPage({ params }: { params: { matchId: string } }) {

    const matchDetails = await getMatchDetails(params.matchId);

    if (!matchDetails) {
        notFound();
    }

    const playerMatchDetails = matchDetails.playerMatchDetails;
    const winners = playerMatchDetails.filter(details => details.Win_Status === 'Winner');
    const losers = playerMatchDetails.filter(details => details.Win_Status === 'Loser');

    const partyIds: Map<number, number> = new Map();
    playerMatchDetails.forEach(matchDetails => {
        const partyId = matchDetails.PartyId;
        if (partyId) {
            if (partyIds.has(partyId)) {
                partyIds.set(partyId, partyIds.get(partyId)! + 1);
            } else {
                partyIds.set(partyId, 1);
            }
        }
    });

    const playerParties: PlayerParties = {}
    let partyNumber = 1;
    partyIds.forEach((value, key) => {
        if (value > 1) {
            playerParties[key] = partyNumber;
            partyNumber += 1;
        }
    })
    
    const renderPlayerCards = (playerDetails: PlayerMatchDetails[]) => {
        return (
            playerDetails.map((details, index) => {
                return (
                    <div id={`player-match-card-container-${details.playerId}`} className='py-1' key={index}>
                        <PlayerMatchCard
                            key={index}
                            playerMatchDetails={details}
                            playerParties={playerParties}
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
                <TextWithLabel label='Duration' value={getTimeString(matchDetails.matchDuration, 'seconds')}/>
            </div>

            <div className='md:columns-3 pb-4 md:flex flex-nowrap'>
                <div className='flex-col flex-1 place-content-center'>
                    <TextWithLabel label='Team 1' value='Victory'/>
                    {renderPlayerCards(winners)}
                </div>
                <div className='flex-col flex-none place-content-center px-8'>
                    <p className='font-bold'>vs</p>
                </div>
                <div className='flex-col flex-1 place-content-center'>
                    <TextWithLabel label='Team 2' value='Defeat'/>
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
