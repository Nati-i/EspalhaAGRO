/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Produto` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Produto" ADD COLUMN     "comoUsar" TEXT,
ADD COLUMN     "condicoesClimaInfo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Produto_nome_key" ON "Produto"("nome");
