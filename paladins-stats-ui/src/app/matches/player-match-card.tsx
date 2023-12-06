'use client'

import { RANKED_QUEUE_ID } from "@/util/constants";
import { PlayerMatchDetails } from "@miguelteran/paladins-api-wrapper"
import { Card, CardBody } from "@nextui-org/react";
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
                <div>
                    <div>{playerMatchDetails.playerName}</div>
                    <div>{playerMatchDetails.Account_Level}</div>
                    <div>{renderRank(playerMatchDetails.League_Tier)}</div>
                    <div>{playerMatchDetails.Reference_Name}</div>
                    <div>{playerMatchDetails.Item_Purch_6}</div>
                </div>
            </CardBody>
        </Card>
    );
}
