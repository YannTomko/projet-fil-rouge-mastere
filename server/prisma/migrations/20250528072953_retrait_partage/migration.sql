/*
  Warnings:

  - You are about to drop the `statistic` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "statistic" DROP CONSTRAINT "statistic_file_id_fkey";

-- DropTable
DROP TABLE "statistic";
