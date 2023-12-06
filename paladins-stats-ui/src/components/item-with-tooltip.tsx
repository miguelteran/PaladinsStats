'use client'

import { Item } from "@miguelteran/paladins-api-wrapper"
import { Tooltip } from "@nextui-org/react";


export interface ItemWithTooltipProps {
    key: number;
    item: Item;
}

export function ItemWithTooltip(props: ItemWithTooltipProps) {

    const { key, item } = props;

    return (
        <div>
            <Tooltip
                key={key}
                placement='bottom'
                content={item.Description}
            >
                <img
                    src={item.itemIcon_URL}
                    alt='item'
                    height='90'
                    width='90'
                />
            </Tooltip>
        </div>
    );

}