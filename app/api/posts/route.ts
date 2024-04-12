'use server';

import { Prisma } from '@prisma/client';

import { db } from '@bootstrap';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const where: Prisma.PostWhereInput = {};
  const slug = searchParams.get('slug');
  if (slug) {
    where.slug = slug;
  }
  const name = searchParams.get('name');
  if (name) {
    where.name = {
      contains: name
    };
  }
  const data = await db.post.findMany({
    where,
    select: {
      id: true,
      parent: true,
      name: true,
      render: true
    },
    orderBy: [{ weight: 'asc' }]
  });
  return Response.json(data);
}
