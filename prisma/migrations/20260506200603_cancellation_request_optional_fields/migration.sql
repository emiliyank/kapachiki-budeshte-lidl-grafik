-- DropForeignKey
ALTER TABLE "CancellationRequest" DROP CONSTRAINT "CancellationRequest_reservationId_fkey";

-- AlterTable
ALTER TABLE "CancellationRequest" ADD COLUMN     "date" DATE,
ADD COLUMN     "name" TEXT,
ALTER COLUMN "reservationId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CancellationRequest" ADD CONSTRAINT "CancellationRequest_reservationId_fkey" FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
