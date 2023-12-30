import { getTalentMatchCount } from '@miguelteran/paladins-stats-db';


export async function POST(request: Request) {
    const filter = await request.json();
    const count = await getTalentMatchCount(filter);
    return Response.json(count);
}
