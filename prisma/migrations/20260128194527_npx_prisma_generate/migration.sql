/*
  Warnings:

  - You are about to drop the `Package` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Payment" DROP CONSTRAINT "Payment_packageId_fkey";

-- DropIndex
DROP INDEX "Payment_paymentId_key";

-- DropTable
DROP TABLE "Package";
