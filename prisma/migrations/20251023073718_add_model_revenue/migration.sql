-- CreateTable
CREATE TABLE `Subcription` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `planId` INTEGER NOT NULL,
    `gymId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `totalPrice` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Subcription` ADD CONSTRAINT `Subcription_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcription` ADD CONSTRAINT `Subcription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `MembershipPlan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcription` ADD CONSTRAINT `Subcription_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
