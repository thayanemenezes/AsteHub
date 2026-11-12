CREATE TYPE "DashboardLanguage" AS ENUM ('PT_BR', 'EN');

ALTER TABLE "User"
ADD COLUMN "dashboardLanguage" "DashboardLanguage" NOT NULL DEFAULT 'PT_BR';

ALTER TABLE "Site"
ADD COLUMN "seoTitle" VARCHAR(70),
ADD COLUMN "seoDescription" VARCHAR(320),
ADD COLUMN "ogTitle" VARCHAR(95),
ADD COLUMN "ogDescription" VARCHAR(200),
ADD COLUMN "ogImageUrl" VARCHAR(2048);
