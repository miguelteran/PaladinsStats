'use client'

import { Tooltip } from "@nextui-org/react";


export interface ImageWithTooltipProps {
    key: number;
    content: string;
    imageUrl: string;
}

export function ImageWithTooltip(props: ImageWithTooltipProps) {

    const { key, content, imageUrl } = props;

    return (
        <div>
            <Tooltip
                key={key}
                placement='bottom'
                content={content}
            >
                <img
                    src={imageUrl}
                    alt='item'
                    height='90'
                    width='90'
                />
            </Tooltip>
        </div>
    );

}