import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { prisma } from './lib/prisma';
import { propriedadeRoutes } from './routes/propriedade.routes';
import { produtoRoutes } from './routes/produto.routes';
import { consultaRoutes } from './routes/consulta.routes';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'espalhaagro-backend' });
});

app.use('/propriedades', propriedadeRoutes);
app.use('/produtos', produtoRoutes);
app.use('/consultas', consultaRoutes);
app.use('/api/produtos', produtoRoutes);
app.use('/api/consultas', consultaRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 3333;

app.listen(PORT, () => {
  console.log(`EspalhaAgro backend rodando em http://localhost:${PORT}`);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
