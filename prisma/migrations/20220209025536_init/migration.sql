-- CreateTable
CREATE TABLE "Elemon" (
    "tokenId" INTEGER NOT NULL,
    "baseCardId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "quality" INTEGER NOT NULL,
    "rarity" INTEGER NOT NULL,
    "purity" INTEGER NOT NULL,
    "level" INTEGER NOT NULL,
    "point" INTEGER NOT NULL,
    "star" INTEGER NOT NULL,
    "bp_1" INTEGER NOT NULL,
    "bp_2" INTEGER NOT NULL,
    "bp_3" INTEGER NOT NULL,
    "bp_4" INTEGER NOT NULL,
    "bp_5" INTEGER NOT NULL,
    "bp_6" INTEGER NOT NULL,
    "skill_1" INTEGER NOT NULL,
    "skill_2" INTEGER,
    "skill_3" INTEGER,
    "skill_4" INTEGER,

    CONSTRAINT "Elemon_pkey" PRIMARY KEY ("tokenId")
);
