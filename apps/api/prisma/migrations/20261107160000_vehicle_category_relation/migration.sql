ALTER TABLE "Vehicle"
ADD COLUMN "categoryId" VARCHAR(30);

CREATE INDEX "Vehicle_categoryId_idx" ON "Vehicle"("categoryId");

ALTER TABLE "Vehicle"
ADD CONSTRAINT "Vehicle_categoryId_fkey"
FOREIGN KEY ("categoryId") REFERENCES "VehicleCategory"("id")
ON DELETE SET NULL ON UPDATE CASCADE;
