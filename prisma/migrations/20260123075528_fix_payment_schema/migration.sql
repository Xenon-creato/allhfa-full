/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `payAddress` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payAmount` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `payCurrency` to the `Payment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "payAddress" TEXT NOT NULL,
ADD COLUMN     "payAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "payCurrency" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paymentId_key" ON "Payment"("paymentId");
