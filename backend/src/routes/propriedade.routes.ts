import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const propriedadeRoutes = Router();

// Lista todas as propriedades cadastradas.
propriedadeRoutes.get('/', async (_req, res) => {
  const propriedades = await prisma.propriedade.findMany({
    orderBy: { criadoEm: 'desc' },
  });
  res.json(propriedades);
});

propriedadeRoutes.put('/:id', async (req, res) => {
  const { nome, cidade, estado, latitude, longitude } = req.body;
  const data: Prisma.PropriedadeUpdateInput = {};

  if (nome !== undefined) {
    if (typeof nome !== 'string' || !nome.trim()) return res.status(400).json({ erro: 'Nome inválido.' });
    data.nome = nome.trim();
  }
  if (cidade !== undefined) {
    if (typeof cidade !== 'string' || !cidade.trim()) return res.status(400).json({ erro: 'Cidade inválida.' });
    data.cidade = cidade.trim();
  }
  if (estado !== undefined) {
    if (typeof estado !== 'string' || estado.trim().length !== 2) return res.status(400).json({ erro: 'Estado deve ser a sigla com 2 letras.' });
    data.estado = estado.trim().toUpperCase();
  }
  if (latitude !== undefined) {
    if (typeof latitude !== 'number' || !Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      return res.status(400).json({ erro: 'Latitude inválida. Deve estar entre -90 e 90.' });
    }
    data.latitude = latitude;
  }
  if (longitude !== undefined) {
    if (typeof longitude !== 'number' || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ erro: 'Longitude inválida. Deve estar entre -180 e 180.' });
    }
    data.longitude = longitude;
  }
  if (Object.keys(data).length === 0) return res.status(400).json({ erro: 'Informe ao menos um campo para atualizar.' });

  try {
    const propriedade = await prisma.propriedade.update({ where: { id: req.params.id }, data });
    return res.json(propriedade);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ erro: 'Propriedade não encontrada.' });
    }
    console.error('Erro ao atualizar propriedade:', error);
    return res.status(500).json({ erro: 'Não foi possível atualizar a propriedade.' });
  }
});

propriedadeRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.propriedade.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ erro: 'Propriedade não encontrada.' });
    }
    console.error('Erro ao excluir propriedade:', error);
    return res.status(500).json({ erro: 'Não foi possível excluir a propriedade.' });
  }
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
