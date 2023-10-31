import { getPlayerBatch } from '@miguelteran/paladins-api-wrapper';
import { type NextRequest } from 'next/server';


export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const playersIds = searchParams.get('ids');
    const players = await getPlayerBatch(playersIds !== null ? playersIds.split(',') : []);
    return Response.json(players);
}
