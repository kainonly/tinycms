'use server';

import { Prisma } from '@prisma/client';

import { db } from '@bootstrap';
import { NavDto } from '@dashboard';

export async function create(data: NavDto) {
  const result = await db.post.create({
    data: {
      parent: data.parent,
      name: data.name,
      render: data.render,
      customize: data.customize,
      menu: {
        connect: {
          slug: data.slug
        }
      },
      content: {
        create: {
          html: ``
        }
      }
    }
  });
  return result.id;
}

export async function update(id: number, data: Prisma.PostUpdateInput) {
  await db.post.update({
    where: { id },
    data
  });
}

export async function setRoute(slug: string, key: string) {
  return db.menu.update({
    where: {
      slug
    },
    data: {
      route: key
    }
  });
}

export async function del(id: number) {
  return db.post.delete({ where: { id } });
}

export async function sort(ids: number[]) {
  await db.$transaction(ids.map((id, weight) => db.post.update({ where: { id }, data: { weight } })));
}

export async function updateSider(id: number, sider: boolean) {
  await db.menu.update({ where: { id }, data: { sider } });
}
