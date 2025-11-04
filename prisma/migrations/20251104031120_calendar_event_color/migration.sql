/*
  Warnings:

  - You are about to drop the column `colour` on the `CalendarEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "CalendarEvent" DROP COLUMN "colour",
ADD COLUMN     "color" TEXT;
