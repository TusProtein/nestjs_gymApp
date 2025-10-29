/*
  Warnings:

  - Made the column `gymId` on table `MembershipPlan` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `MembershipPlan` DROP FOREIGN KEY `MembershipPlan_gymId_fkey`;

-- DropIndex
DROP INDEX `MembershipPlan_gymId_fkey` ON `MembershipPlan`;

-- AlterTable
ALTER TABLE `MembershipPlan` MODIFY `gymId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `MembershipPlan` ADD CONSTRAINT `MembershipPlan_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
