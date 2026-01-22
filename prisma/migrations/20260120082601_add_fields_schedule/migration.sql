-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `cancelledAt` DATETIME(3) NULL,
    ADD COLUMN `cancelledBy` ENUM('SUPER_ADMIN', 'ADMIN', 'PT', 'MEMBER') NULL,
    ADD COLUMN `completedAt` DATETIME(3) NULL;
