CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'CLOSED');

CREATE TABLE "Lead" (
    "id" VARCHAR(30) NOT NULL,
    "organizationId" VARCHAR(30) NOT NULL,
    "contactName" VARCHAR(120) NOT NULL,
    "email" VARCHAR(320),
    "phone" VARCHAR(15) NOT NULL,
    "message" VARCHAR(1000) NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "vehicleId" VARCHAR(30),
    "locationId" VARCHAR(30),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Lead_organizationId_createdAt_idx"
ON "Lead"("organizationId", "createdAt");
CREATE INDEX "Lead_organizationId_status_createdAt_idx"
ON "Lead"("organizationId", "status", "createdAt");

ALTER TABLE "Lead"
ADD CONSTRAINT "Lead_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Lead"
ADD CONSTRAINT "Lead_vehicleId_fkey"
FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "Lead"
ADD CONSTRAINT "Lead_locationId_fkey"
FOREIGN KEY ("locationId") REFERENCES "Location"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
