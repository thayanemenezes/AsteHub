CREATE TABLE "Site" (
    "id" VARCHAR(30) NOT NULL,
    "organizationId" VARCHAR(30) NOT NULL,
    "publicName" VARCHAR(120) NOT NULL,
    "slug" VARCHAR(60) NOT NULL,
    "domain" VARCHAR(253),
    "phone" VARCHAR(40),
    "description" VARCHAR(1000),
    "primaryColor" CHAR(7),
    "secondaryColor" CHAR(7),
    "logoUrl" VARCHAR(2048),
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Site_organizationId_key" ON "Site"("organizationId");
CREATE UNIQUE INDEX "Site_slug_key" ON "Site"("slug");
CREATE UNIQUE INDEX "Site_domain_key" ON "Site"("domain");

ALTER TABLE "Site"
ADD CONSTRAINT "Site_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
