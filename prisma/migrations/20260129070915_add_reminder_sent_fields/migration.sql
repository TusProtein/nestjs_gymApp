-- AlterTable
ALTER TABLE `Schedule` ADD COLUMN `reminderSent` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `reminderSentAt` DATETIME(3) NULL;
