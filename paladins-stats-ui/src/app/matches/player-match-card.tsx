'use client'

import { RANKED_QUEUE_ID } from "@/util/constants";
import { PlayerMatchDetails } from "@miguelteran/paladins-api-wrapper"
import { Card, CardBody, Link } from "@nextui-org/react";
import { TextWithLabel } from "@/components/text-with-label";
import { ImageWithFallback } from "@/components/image-with-fallback";
import { getRank } from "@/util/static-data";
import champions from '../../../public/champions.json' assert { type: 'json' };


export interface PlayerMatchCardProps {
    key: number;
    playerMatchDetails: PlayerMatchDetails;
}

export const PlayerMatchCard = (props: PlayerMatchCardProps) => {

    const { key, playerMatchDetails } = props;

    const renderRank = (rankId: number) => {
        if (playerMatchDetails.match_queue_id !== RANKED_QUEUE_ID) {
            return undefined;
        } else {
            return getRank(rankId);
        }
    }

    const championName = playerMatchDetails.Reference_Name;
    const champion = champions.find(c => c.Name === championName);

    return (
        <Card key={key}>
            <CardBody>
                <div id='player-match-card-content' className='flex columns-2'>
                    <div id='player-match-card-champion-image' className='min-w-16 max-w-24 mr-4'>
                        <ImageWithFallback
                            src={champion ? champion.ChampionIcon_URL : ''}
                            fallback='/paladins-logo.jpg'
                        />
                    </div>
                    <div id='player-match-card-info'>
                        <Link href={`/players/${playerMatchDetails.playerId}`}>{playerMatchDetails.playerName}</Link>
                        <TextWithLabel label='Rank' value={renderRank(playerMatchDetails.League_Tier)}/>
                        <TextWithLabel label='Level' value={playerMatchDetails.Account_Level}/>
                        <p>{championName}</p>
                        <p>{playerMatchDetails.Item_Purch_6}</p>
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}
