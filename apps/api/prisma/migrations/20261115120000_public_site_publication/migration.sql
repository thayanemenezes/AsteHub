ALTER TABLE "Organization"
ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE "Vehicle"
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Location"
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Site"
ADD COLUMN "isPublished" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "Vehicle_organizationId_isPublished_idx"
ON "Vehicle"("organizationId", "isPublished");

CREATE INDEX "Location_organizationId_isPublished_idx"
ON "Location"("organizationId", "isPublished");
