CREATE TABLE "OrganizationInvitation" (
    "id" VARCHAR(30) NOT NULL,
    "organizationId" VARCHAR(30) NOT NULL,
    "email" VARCHAR(320) NOT NULL,
    "tokenHash" CHAR(64) NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "expiresAt" TIMESTAMPTZ(3) NOT NULL,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrganizationInvitation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "OrganizationInvitation_tokenHash_key" ON "OrganizationInvitation"("tokenHash");
CREATE UNIQUE INDEX "OrganizationInvitation_organizationId_email_key" ON "OrganizationInvitation"("organizationId", "email");
CREATE INDEX "OrganizationInvitation_organizationId_expiresAt_idx" ON "OrganizationInvitation"("organizationId", "expiresAt");

ALTER TABLE "OrganizationInvitation" ADD CONSTRAINT "OrganizationInvitation_organizationId_fkey"
FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
