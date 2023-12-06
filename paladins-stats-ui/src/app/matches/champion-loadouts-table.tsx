'use client'

import { Key, useCallback } from "react";
import { CustomTable, CustomTableColumn } from "@/components/table";
import { Item, PlayerMatchDetails } from "@miguelteran/paladins-api-wrapper";
import { NUMBER_OF_CARDS_IN_LOADOUT, NUMBER_OF_ITEMS_IN_MATCH } from "@/util/constants";
import { ItemWithTooltip } from "@/components/item-with-tooltip";
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
            return renderItems(details, items, 'ActiveId', NUMBER_OF_ITEMS_IN_MATCH);
        } else if (columnKey === 'Loadout') {
            return renderItems(details, championCards, 'ItemId', NUMBER_OF_CARDS_IN_LOADOUT);
        } else if (columnKey === 'Talent') {
            return renderItem(details, championTalents, 'ItemId6');
        } else {
            return undefined;
        }
    }, []);

    const renderItems = (details: PlayerMatchDetails, items: Item[], itemKey: string, numberOfItems: number) => {
        return (
            <div>
                {Array.from({length: numberOfItems}, (v, k) => k+1).map(k => renderItem(details, items, `${itemKey}${k}`))}
            </div>
        );
    }

    const renderItem = (details: PlayerMatchDetails, items: Item[], itemKey: string) => {
        const item = items.find(i => i.ItemId === details[itemKey]);
        return item && <ItemWithTooltip key={item.ItemId} item={item}/>;
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
