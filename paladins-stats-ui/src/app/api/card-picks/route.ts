import { getCardPickCounts } from '@miguelteran/paladins-stats-db';


export async function POST(request: Request) {
    const filter = await request.json();
    const count = await getCardPickCounts(filter);
    return Response.json(count);
}
