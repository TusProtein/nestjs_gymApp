-- CreateTable
CREATE TABLE `WorkoutProgress` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `memberId` INTEGER NOT NULL,
    `ptId` INTEGER NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `weight` DOUBLE NULL,
    `bodyFat` DOUBLE NULL,
    `muscleMass` DOUBLE NULL,
    `notes` VARCHAR(191) NULL,
    `performance` JSON NULL,
    `gymId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `WorkoutProgress` ADD CONSTRAINT `WorkoutProgress_gymId_fkey` FOREIGN KEY (`gymId`) REFERENCES `Gym`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutProgress` ADD CONSTRAINT `WorkoutProgress_memberId_fkey` FOREIGN KEY (`memberId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `WorkoutProgress` ADD CONSTRAINT `WorkoutProgress_ptId_fkey` FOREIGN KEY (`ptId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
