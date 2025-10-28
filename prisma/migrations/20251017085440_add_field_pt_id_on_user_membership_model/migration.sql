-- AlterTable
ALTER TABLE `UserMembership` ADD COLUMN `ptId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `UserMembership_ptId_idx` ON `UserMembership`(`ptId`);

-- AddForeignKey
ALTER TABLE `UserMembership` ADD CONSTRAINT `UserMembership_ptId_fkey` FOREIGN KEY (`ptId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
