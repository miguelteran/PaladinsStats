'use client'

import { ImageWithFallback } from "@/components/image-with-fallback";


export function ProfilePicture({url}: {url: string}) {
    return (
        <ImageWithFallback
            src={url}
            fallback='/paladins-logo.jpg'
            alt='Profile picture'
            height={70}
            width={90}
        />
    );
}