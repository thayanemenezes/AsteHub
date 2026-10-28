CREATE TABLE "VehicleCategory" (
    "id" VARCHAR(30) NOT NULL,
    "organizationId" VARCHAR(30) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" VARCHAR(500),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "VehicleCategory_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "VehicleCategory_organizationId_name_key"
ON "VehicleCategory"("organizationId", "name");

CREATE INDEX "VehicleCategory_organizationId_createdAt_idx"
ON "VehicleCategory"("organizationId", "createdAt");

ALTER TABLE "VehicleCategory"
ADD CONSTRAINT "VehicleCategory_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
