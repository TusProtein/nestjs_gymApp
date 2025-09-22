/*
  Warnings:

  - You are about to drop the column `titte` on the `WorkoutPlan` table. All the data in the column will be lost.
  - Added the required column `title` to the `WorkoutPlan` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `WorkoutPlan` DROP COLUMN `titte`,
    ADD COLUMN `title` VARCHAR(191) NOT NULL;
