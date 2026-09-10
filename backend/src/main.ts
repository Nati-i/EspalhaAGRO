import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Rota de verificação - confirma que o servidor e a config básica estão no ar.
// As rotas reais (cadastro de produto, propriedade, consulta de aplicação)
// serão implementadas na entrega final, junto com a integração ao frontend.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'espalhaagro-backend' });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(PORT, () => {
  console.log(`EspalhaAgro backend rodando em http://localhost:${PORT}`);
});

// Encerra a conexão do Prisma de forma limpa ao finalizar o processo.
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
