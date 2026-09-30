import { Router } from 'express';
import { prisma } from '../lib/prisma';

export const propriedadeRoutes = Router();

// Lista todas as propriedades cadastradas.
propriedadeRoutes.get('/', async (_req, res) => {
  const propriedades = await prisma.propriedade.findMany({
    orderBy: { criadoEm: 'desc' },
  });
  res.json(propriedades);
});

// Cadastra uma nova propriedade.
propriedadeRoutes.post('/', async (req, res) => {
  const { nome, cidade, estado, latitude, longitude } = req.body;

  if (!nome || !cidade || !estado || latitude == null || longitude == null) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: nome, cidade, estado, latitude, longitude.',
    });
  }

  if (typeof latitude !== 'number' || latitude < -90 || latitude > 90) {
    return res.status(400).json({ erro: 'Latitude inválida. Deve estar entre -90 e 90.' });
  }

  if (typeof longitude !== 'number' || longitude < -180 || longitude > 180) {
    return res.status(400).json({ erro: 'Longitude inválida. Deve estar entre -180 e 180.' });
  }

  if (typeof estado !== 'string' || estado.trim().length !== 2) {
    return res.status(400).json({ erro: 'Estado deve ser a sigla com 2 letras (ex: SC).' });
  }

  const propriedade = await prisma.propriedade.create({
    data: { nome, cidade, estado: estado.toUpperCase(), latitude, longitude },
  });

  res.status(201).json(propriedade);
});
