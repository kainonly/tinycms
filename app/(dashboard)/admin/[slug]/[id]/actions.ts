'use server';

import { Prisma } from '@prisma/client';

import { db } from '@bootstrap';
import { PostDto } from '@dashboard';

export async function update(id: number, data: PostDto) {
  let metadata;
  if (data.content.metadata) {
    metadata = data.content.metadata as Prisma.JsonObject;
  }

  await db.post.update({
    where: { id },
    data: {
      name: data.name,
      render: data.render,
      status: data.status,
      summary: data.summary,
      thumbnail: data.thumbnail,
      content: {
        update: {
          html: data.content.html,
          metadata
        }
      }
    }
  });
}
