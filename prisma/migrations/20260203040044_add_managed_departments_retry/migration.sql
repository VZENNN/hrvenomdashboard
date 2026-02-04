-- CreateTable
CREATE TABLE "_ManagerDepartments" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ManagerDepartments_AB_unique" ON "_ManagerDepartments"("A", "B");

-- CreateIndex
CREATE INDEX "_ManagerDepartments_B_index" ON "_ManagerDepartments"("B");

-- AddForeignKey
ALTER TABLE "_ManagerDepartments" ADD CONSTRAINT "_ManagerDepartments_A_fkey" FOREIGN KEY ("A") REFERENCES "Department"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ManagerDepartments" ADD CONSTRAINT "_ManagerDepartments_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
