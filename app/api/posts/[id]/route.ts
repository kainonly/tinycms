'use server';

import { db } from '@bootstrap';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const data = await db.post.findFirst({
    include: { content: true },
    where: { id: Number(params.id) }
  });
  return Response.json(data);
}
