'use client'

import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/button";


export default function Home() {

    const router = useRouter();

    return (
        <div>
            <Button onPress={() => router.push('/search')}>
                Search Players
            </Button>
            <Button onPress={() => router.push('/ranked-stats')}>
                Ranked Stats
            </Button>
        </div>
    );
}
