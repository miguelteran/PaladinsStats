import { searchPlayers } from '@miguelteran/paladins-api-wrapper';
import { type NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const playerName = searchParams.get('playerName');
    if (!playerName) {
        return Response.json([]);
    }
    const players = await searchPlayers(playerName);
    return Response.json(players);
}
