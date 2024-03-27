import { getChampionPickCounts } from '@miguelteran/paladins-stats-db';


export async function POST(request: Request) {
    const filter = await request.json();
    const counts = await getChampionPickCounts(filter);
    return Response.json(counts);
}
