-- CreateTable
CREATE TABLE `Schedule` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `ptId` INTEGER NOT NULL,
    `memberId` INTEGER NOT NULL,
    `startTime` DATETIME(3) NOT NULL,
    `endTime` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'Scheduled',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_ptId_fkey` FOREIGN KEY (`ptId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
