-- AlterTable
ALTER TABLE "Payment" ADD COLUMN     "creditsAdded" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paddleCheckoutUrl" TEXT,
ADD COLUMN     "paddleEmail" TEXT,
ADD COLUMN     "paddleProductId" TEXT,
ALTER COLUMN "paymentId" DROP NOT NULL,
ALTER COLUMN "invoiceUrl" DROP NOT NULL,
ALTER COLUMN "payAddress" DROP NOT NULL,
ALTER COLUMN "payAmount" DROP NOT NULL,
ALTER COLUMN "payCurrency" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Image" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "prompt" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Package" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "paddleProductId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Package_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Image_userId_idx" ON "Image"("userId");

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
