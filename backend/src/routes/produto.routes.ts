import { Router } from 'express';
import { Categoria } from '@prisma/client';
import { prisma } from '../lib/prisma';

export const produtoRoutes = Router();

const CATEGORIAS_VALIDAS = ['HERBICIDA', 'FUNGICIDA', 'INSETICIDA', 'ACARICIDA', 'NEMATICIDA', 'OUTROS'];

// Lista todos os produtos cadastrados.
produtoRoutes.get('/', async (req, res) => {
  const categoria = req.query.categoria;
  if (categoria !== undefined && (typeof categoria !== 'string' || !CATEGORIAS_VALIDAS.includes(categoria))) {
    return res.status(400).json({ erro: 'Categoria inválida.' });
  }

  try {
    const produtos = await prisma.produto.findMany({
      ...(typeof categoria === 'string' ? { where: { categoria: categoria as Categoria } } : {}),
      orderBy: { nome: 'asc' },
    });
    return res.json(produtos);
  } catch (error) {
    console.error('Erro ao listar produtos:', error);
    return res.status(503).json({ erro: 'Banco de produtos indisponível. Verifique a conexão DATABASE_URL do backend.' });
  }
});

produtoRoutes.get('/:id', async (req, res) => {
  try {
    const produto = await prisma.produto.findUnique({ where: { id: req.params.id } });
    if (!produto) return res.status(404).json({ erro: 'Produto não encontrado.' });
    return res.json(produto);
  } catch (error) {
    console.error('Erro ao carregar produto:', error);
    return res.status(503).json({ erro: 'Banco de produtos indisponível. Verifique a conexão DATABASE_URL do backend.' });
  }
});

// Cadastra um novo produto, com os parâmetros técnicos vindos da bula/Agrofit.
produtoRoutes.post('/', async (req, res) => {
  const {
    nome,
    categoria,
    principioAtivo,
    fabricante,
    carenciaDias,
    intervaloSemChuvaHoras,
    tempMinima,
    tempMaxima,
    umidadeMinima,
    ventoMaximo,
    sensibilidadeNebulosidade,
    comoUsar,
    condicoesClimaInfo,
  } = req.body;

  if (
    typeof nome !== 'string' || !nome.trim() ||
    typeof principioAtivo !== 'string' || !principioAtivo.trim() ||
    typeof fabricante !== 'string' || !fabricante.trim() ||
    !categoria || carenciaDias == null || intervaloSemChuvaHoras == null
  ) {
    return res.status(400).json({
      erro: 'Informe nome, princípio ativo, fabricante, categoria, carência e intervalo sem chuva.',
    });
  }

  if (!CATEGORIAS_VALIDAS.includes(categoria)) {
    return res.status(400).json({
      erro: `Categoria inválida. Use uma de: ${CATEGORIAS_VALIDAS.join(', ')}.`,
    });
  }

  if (!Number.isInteger(carenciaDias) || carenciaDias < 0) {
    return res.status(400).json({ erro: 'carenciaDias deve ser um inteiro maior ou igual a 0.' });
  }

  const parametrosNumericos = [intervaloSemChuvaHoras, tempMinima, tempMaxima, umidadeMinima, ventoMaximo];
  if (parametrosNumericos.some((valor) => valor != null && (typeof valor !== 'number' || !Number.isFinite(valor)))) {
    return res.status(400).json({ erro: 'Os parâmetros técnicos devem ser números válidos.' });
  }

  if (intervaloSemChuvaHoras < 0 || [tempMinima, tempMaxima, umidadeMinima, ventoMaximo].some((valor) => valor != null && valor < 0)) {
    return res.status(400).json({ erro: 'Os limites técnicos não podem ser negativos.' });
  }

  if (tempMinima != null && tempMaxima != null && tempMinima > tempMaxima) {
    return res.status(400).json({ erro: 'tempMinima deve ser menor ou igual a tempMaxima.' });
  }

  if (umidadeMinima != null && umidadeMinima > 100) {
    return res.status(400).json({ erro: 'umidadeMinima deve estar entre 0 e 100.' });
  }

  if (sensibilidadeNebulosidade != null && typeof sensibilidadeNebulosidade !== 'boolean') {
    return res.status(400).json({ erro: 'sensibilidadeNebulosidade deve ser booleano.' });
  }
  if ((comoUsar != null && typeof comoUsar !== 'string') || (condicoesClimaInfo != null && typeof condicoesClimaInfo !== 'string')) {
    return res.status(400).json({ erro: 'comoUsar e condicoesClimaInfo devem ser textos.' });
  }

  const produto = await prisma.produto.create({
    data: {
      nome: nome.trim(),
      principioAtivo: principioAtivo.trim(),
      fabricante: fabricante.trim(),
      categoria,
      carenciaDias,
      intervaloSemChuvaHoras,
      tempMinima: tempMinima ?? null,
      tempMaxima: tempMaxima ?? null,
      umidadeMinima: umidadeMinima ?? null,
      ventoMaximo: ventoMaximo ?? null,
      sensibilidadeNebulosidade: sensibilidadeNebulosidade ?? false,
      comoUsar: comoUsar ?? null,
      condicoesClimaInfo: condicoesClimaInfo ?? null,
    },
  });

  res.status(201).json(produto);
});
