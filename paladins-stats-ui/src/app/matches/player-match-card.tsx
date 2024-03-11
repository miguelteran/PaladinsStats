'use client'

import { RANKED_QUEUE_ID } from "@/util/constants";
import { PlayerMatchDetails } from "@miguelteran/paladins-api-wrapper"
import { Card, CardBody, Link } from "@nextui-org/react";
import { TextWithLabel } from "@/components/text-with-label";
import ranks from '../../../public/ranks.json' assert { type: 'json' };


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
            return ranks.find(rank => rank.id === rankId)?.name;
        }
    }

    return (
        <Card key={key}>
            <CardBody>
                <div id='player-match-card-content'>
                    <Link href={`/players/${playerMatchDetails.playerId}`}>{playerMatchDetails.playerName}</Link>
                    <TextWithLabel label='Rank' value={renderRank(playerMatchDetails.League_Tier)}/>
                    <TextWithLabel label='Level' value={playerMatchDetails.Account_Level}/>
                    <p>{playerMatchDetails.Reference_Name}</p>
                    <p>{playerMatchDetails.Item_Purch_6}</p>
                </div>
            </CardBody>
        </Card>
    );
}
