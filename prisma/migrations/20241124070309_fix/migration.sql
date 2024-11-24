/*
  Warnings:

  - You are about to drop the column `hashed` on the `User` table. All the data in the column will be lost.
  - Added the required column `hash` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `User` DROP COLUMN `hashed`,
    ADD COLUMN `hash` VARCHAR(191) NOT NULL;
