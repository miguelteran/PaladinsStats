'use client'

export interface ImageWithFallbackProps {
    src: string;
    fallback: string;
    alt?: string;
    height?: number;
    width?: number;
}

export const ImageWithFallback = (props: ImageWithFallbackProps) => {

    const { src, fallback, alt, height, width } = props;

    const onImageError = (event: any) => {
        event.target.src = fallback;
    };

    return (
        <img
            src={src ?? fallback}
            alt={alt}
            onError={onImageError}
            height={height}
            width={width}
        />
    );
}
