import { getTotalMatchCount } from '@miguelteran/paladins-stats-db';


export async function POST(request: Request) {
    const filter = await request.json();
    const count = await getTotalMatchCount(filter);
    return Response.json(count);
}
