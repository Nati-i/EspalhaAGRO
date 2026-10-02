
ALTER TABLE "Produto" ADD COLUMN     "comoUsar" TEXT,
ADD COLUMN     "condicoesClimaInfo" TEXT;
CREATE UNIQUE INDEX "Produto_nome_key" ON "Produto"("nome");
