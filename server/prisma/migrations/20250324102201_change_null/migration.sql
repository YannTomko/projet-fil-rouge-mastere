/*
  Warnings:

  - Made the column `name` on table `files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `path` on table `files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `owner` on table `files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `size` on table `files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `created` on table `files` required. This step will fail if there are existing NULL values in that column.
  - Made the column `last_access_date_time` on table `statistics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `username` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `users` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `users` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "files" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "path" SET NOT NULL,
ALTER COLUMN "owner" SET NOT NULL,
ALTER COLUMN "size" SET NOT NULL,
ALTER COLUMN "created" SET NOT NULL;

-- AlterTable
ALTER TABLE "statistics" ALTER COLUMN "last_access_date_time" SET NOT NULL;

-- AlterTable
ALTER TABLE "users" ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "password" SET NOT NULL;
