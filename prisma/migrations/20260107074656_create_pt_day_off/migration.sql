/*
  Warnings:

  - You are about to alter the column `status` on the `Schedule` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.

*/
-- AlterTable
ALTER TABLE `Schedule` MODIFY `status` ENUM('AVAILABLE', 'BOOKED', 'CANCELLED') NOT NULL DEFAULT 'AVAILABLE';

-- CreateTable
CREATE TABLE `PtDayOff` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ptId` INTEGER NOT NULL,
    `weekday` ENUM('MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN') NOT NULL,

    UNIQUE INDEX `PtDayOff_ptId_weekday_key`(`ptId`, `weekday`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PtDayOff` ADD CONSTRAINT `PtDayOff_ptId_fkey` FOREIGN KEY (`ptId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
