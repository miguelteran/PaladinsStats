import { getBanCountForAllChampions } from '@miguelteran/paladins-stats-db';


export async function POST(request: Request) {
    const filter = await request.json();
    const counts = await getBanCountForAllChampions(filter);
    return Response.json(counts);
}
