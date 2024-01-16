import { getItemCount } from '@miguelteran/paladins-stats-db';


export async function POST(request: Request) {
    const filter = await request.json();
    const count = await getItemCount(filter);
    return Response.json(count);
}
