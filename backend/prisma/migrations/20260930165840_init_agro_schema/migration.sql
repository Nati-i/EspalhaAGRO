-- CreateEnum
CREATE TYPE "Categoria" AS ENUM ('HERBICIDA', 'FUNGICIDA', 'INSETICIDA', 'ACARICIDA', 'NEMATICIDA', 'OUTROS');

-- CreateEnum
CREATE TYPE "StatusRecomendacao" AS ENUM ('COMPATIVEL', 'ATENCAO', 'NAO_RECOMENDADO');

-- CreateTable
CREATE TABLE "Propriedade" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "cidade" TEXT NOT NULL,
    "estado" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Propriedade_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Produto" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "principioAtivo" TEXT NOT NULL,
    "fabricante" TEXT NOT NULL,
    "categoria" "Categoria" NOT NULL,
    "carenciaDias" INTEGER NOT NULL,
    "intervaloSemChuvaHoras" DOUBLE PRECISION NOT NULL,
    "tempMinima" DOUBLE PRECISION,
    "tempMaxima" DOUBLE PRECISION,
    "umidadeMinima" DOUBLE PRECISION,
    "ventoMaximo" DOUBLE PRECISION,
    "sensibilidadeNebulosidade" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Produto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsultaAplicacao" (
    "id" TEXT NOT NULL,
    "produtoId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "temperatura" DOUBLE PRECISION NOT NULL,
    "umidade" DOUBLE PRECISION NOT NULL,
    "vento" DOUBLE PRECISION NOT NULL,
    "chuvaPrevista" DOUBLE PRECISION NOT NULL,
    "statusRecomendacao" "StatusRecomendacao" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConsultaAplicacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ConsultaAplicacao" ADD CONSTRAINT "ConsultaAplicacao_produtoId_fkey" FOREIGN KEY ("produtoId") REFERENCES "Produto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
