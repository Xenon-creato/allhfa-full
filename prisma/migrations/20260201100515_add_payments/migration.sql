/*
  Warnings:

  - You are about to drop the column `paddleCheckoutUrl` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paddleEmail` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `paddleProductId` on the `Payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "paddleCheckoutUrl",
DROP COLUMN "paddleEmail",
DROP COLUMN "paddleProductId";
