'use client'

import { Key, useCallback } from "react";
import { CustomTable, CustomTableColumn } from "@/components/table";
import { PlayerMatchDetails } from "@miguelteran/paladins-api-wrapper";
import { NUMBER_OF_CARDS_IN_LOADOUT, NUMBER_OF_ITEMS_IN_MATCH } from "@/util/constants";
import { ImageWithTooltip } from "@/components/image-with-tooltip";
import items from "../../../public/items.json";
import championCards from "../../../public/champion-cards.json";
import championTalents from "../../../public/champion-talents.json";


const columns: CustomTableColumn[] = [
    { key: 'playerName', label: 'Player' },
    { key: 'Reference_Name', label: 'Champion' },
    { key: 'Items', label: 'Items' },
    { key: 'Loadout', label: 'Loadout' },
    { key: 'Talent', label: 'Talent' },
];

export interface ChampionLoadoutsTableProps {
    playerMatchDetails: PlayerMatchDetails[];
}

export const ChampionLoadoutsTable = (props: ChampionLoadoutsTableProps) => {

    const { playerMatchDetails } = props;

    const renderCell = useCallback((details: PlayerMatchDetails, columnKey: Key) => {
        if (columnKey === 'Items') {
            return renderImages(details, 'ActiveId', NUMBER_OF_ITEMS_IN_MATCH, renderItem);
        } else if (columnKey === 'Loadout') {
            return renderImages(details, 'ItemId', NUMBER_OF_CARDS_IN_LOADOUT, renderChampionCard);
        } else if (columnKey === 'Talent') {
            return renderChampionTalent(details, 'ItemId6');
        } else {
            return undefined;
        }
    }, []);

    const renderImages = (details: PlayerMatchDetails, key: string, numberOfItems: number, renderImage: (details: PlayerMatchDetails, key: string) => any) => {
        return (
            <div className="flex flex-row">
                {Array.from({length: numberOfItems}, (v, k) => k+1).map(k => renderImage(details, `${key}${k}`))}
            </div>
        );
    }

    const renderItem = (details: PlayerMatchDetails, key: string) => {
        const item = items.find(i => i.ItemId === details[key]);
        return item && renderImageWithTooltip(item.ItemId, item.Description, item.itemIcon_URL);
    }

    const renderChampionCard = (details: PlayerMatchDetails, key: string) => {
        const card = championCards.find(c => c.card_id2 === details[key]);
        return card && renderImageWithTooltip(card.card_id2, card.card_description, card.championCard_URL);
    }

    const renderChampionTalent = (details: PlayerMatchDetails, key: string) => {
        const talent = championTalents.find(t => t.card_id2 === details[key]);
        return talent && renderImageWithTooltip(talent.card_id2, talent.card_description, talent.championTalent_URL);
    }

    const renderImageWithTooltip = (key: number, content: string, imageUrl: string) => {
        return (
            <ImageWithTooltip 
                key={key}
                content={content}
                imageUrl={imageUrl}
            />
        )
    }

    return (
        <CustomTable<PlayerMatchDetails>
            rows={playerMatchDetails}
            columns={columns}
            tableRowKey='playerId'
            customCellRenderer={renderCell}
        />
    );
}
