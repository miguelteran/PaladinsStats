'use client'

import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";


export default function Home() {

    const router = useRouter();

    const renderButton = (uri: string, displayText: string) => {
        return (
            <div className="flex flex-col w-full place-content-center px-4">
                <Button onPress={() => router.push(uri)}>
                    {displayText}
                </Button>
            </div>
        );
    };

    return (
        <div className="flex w-full min-h-dvh columns-2">
            {renderButton('/search', 'Search Players')}
            {renderButton('/ranked-stats', 'Ranked Stats')}
        </div>
    );
}
