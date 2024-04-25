'use client'

import { Tooltip } from "@nextui-org/react";
import { ImageWithFallback } from "./image-with-fallback";


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
                <div className='min-w-16 max-w-24'>
                    <ImageWithFallback
                        src={imageUrl}
                        fallback='/unknown-item.png'
                    />
                </div>
            </Tooltip>
        </div>
    );

}