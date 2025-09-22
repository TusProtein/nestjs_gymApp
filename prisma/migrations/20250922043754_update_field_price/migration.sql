/*
  Warnings:

  - You are about to alter the column `price` on the `MembershipPlan` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `Decimal(12,2)`.
  - A unique constraint covering the columns `[name]` on the table `MembershipPlan` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `MembershipPlan` MODIFY `price` DECIMAL(12, 2) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `MembershipPlan_name_key` ON `MembershipPlan`(`name`);
