-- AlterTable
ALTER TABLE "Deployment" ADD COLUMN "task" TEXT;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Volunteer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "primarySkill" TEXT NOT NULL,
    "fitnessLevel" TEXT NOT NULL DEFAULT 'Medium',
    "currentSector" INTEGER NOT NULL DEFAULT 1,
    "fatigueScore" INTEGER NOT NULL DEFAULT 0,
    "shiftTiming" TEXT NOT NULL DEFAULT '06:00 AM - 02:00 PM',
    "status" TEXT NOT NULL DEFAULT 'Available',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Volunteer" ("age", "createdAt", "currentSector", "fatigueScore", "fitnessLevel", "id", "name", "phone", "primarySkill", "status") SELECT "age", "createdAt", "currentSector", "fatigueScore", "fitnessLevel", "id", "name", "phone", "primarySkill", "status" FROM "Volunteer";
DROP TABLE "Volunteer";
ALTER TABLE "new_Volunteer" RENAME TO "Volunteer";
CREATE UNIQUE INDEX "Volunteer_phone_key" ON "Volunteer"("phone");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
