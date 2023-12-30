import { getMatchCountForAllChampions } from '@miguelteran/paladins-stats-db';


export async function POST(request: Request) {
    const filter = await request.json();
    const counts = await getMatchCountForAllChampions(filter);
    return Response.json(counts);
}
