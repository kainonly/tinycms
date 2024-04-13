-- CreateEnum
CREATE TYPE "Render" AS ENUM ('page', 'catalog', 'gallery', 'customize');

-- CreateTable
CREATE TABLE "menus" (
    "id" SERIAL NOT NULL,
    "slug" VARCHAR(20) NOT NULL,
    "name" VARCHAR(20) NOT NULL,
    "sider" BOOLEAN NOT NULL DEFAULT false,
    "route" VARCHAR(20) NOT NULL DEFAULT '',
    "weight" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" SERIAL NOT NULL,
    "cid" INTEGER NOT NULL,
    "create_time" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "update_time" TIMESTAMP(3) NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT true,
    "parent" INTEGER NOT NULL DEFAULT 0,
    "name" VARCHAR(50) NOT NULL,
    "summary" VARCHAR(100) NOT NULL DEFAULT '',
    "thumbnail" VARCHAR NOT NULL DEFAULT '',
    "render" "Render" NOT NULL,
    "customize" VARCHAR(20) NOT NULL DEFAULT '',
    "slug" VARCHAR(20) NOT NULL,
    "weight" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contents" (
    "id" SERIAL NOT NULL,
    "html" TEXT NOT NULL,
    "metadata" JSONB NOT NULL DEFAULT '{}',

    CONSTRAINT "contents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menus_slug_key" ON "menus"("slug");

-- CreateIndex
CREATE INDEX "menus_slug_idx" ON "menus"("slug");

-- CreateIndex
CREATE INDEX "posts_name_idx" ON "posts"("name");

-- CreateIndex
CREATE INDEX "posts_cid_idx" ON "posts"("cid");

-- CreateIndex
CREATE INDEX "posts_slug_idx" ON "posts"("slug");
