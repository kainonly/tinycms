'use server';

import { db } from '@bootstrap';

export async function GET() {
  const data = await db.menu.findMany({
    orderBy: [{ weight: 'asc' }]
  });
  return Response.json(data);
}
