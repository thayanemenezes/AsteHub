CREATE TABLE "Location" (
    "id" VARCHAR(30) NOT NULL,
    "organizationId" VARCHAR(30) NOT NULL,
    "name" VARCHAR(120) NOT NULL,
    "address" VARCHAR(250) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "state" VARCHAR(100) NOT NULL,
    "phone" VARCHAR(40),
    "description" VARCHAR(500),
    "managerName" VARCHAR(120),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Location_organizationId_createdAt_idx"
ON "Location"("organizationId", "createdAt");

ALTER TABLE "Location"
ADD CONSTRAINT "Location_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
