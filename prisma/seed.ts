import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.menu.createMany({
    data: [
      { name: '总览', slug: 'overview', weight: 0 },
      { name: '我的博客', slug: 'blogs', weight: 1 },
      { name: '作品集', slug: 'portfolio', weight: 2 },
      { name: '关于', slug: 'about', weight: 3 }
    ]
  });
  // ...创建更多数据...
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
