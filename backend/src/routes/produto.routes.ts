import { Router } from 'express';
import { Categoria, Prisma } from '@prisma/client';
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

produtoRoutes.put('/:id', async (req, res) => {
  const {
    nome, descricao, preco, categoria, principioAtivo, fabricante, carenciaDias,
    intervaloSemChuvaHoras, tempMinima, tempMaxima, umidadeMinima, ventoMaximo,
    sensibilidadeNebulosidade, comoUsar, condicoesClimaInfo,
  } = req.body;
  const data: Prisma.ProdutoUpdateInput = {};

  const textos: Array<['nome' | 'descricao' | 'principioAtivo' | 'fabricante' | 'comoUsar' | 'condicoesClimaInfo', unknown, boolean]> = [
    ['nome', nome, true],
    ['descricao', descricao, false],
    ['principioAtivo', principioAtivo, true],
    ['fabricante', fabricante, true],
    ['comoUsar', comoUsar, false],
    ['condicoesClimaInfo', condicoesClimaInfo, false],
  ];
  for (const [campo, valor, obrigatorio] of textos) {
    if (valor === undefined) continue;
    if (valor === null && !obrigatorio && ['descricao', 'comoUsar', 'condicoesClimaInfo'].includes(campo)) {
      Object.assign(data, { [campo]: null });
      continue;
    }
    if (typeof valor !== 'string' || (obrigatorio && !valor.trim())) {
      return res.status(400).json({ erro: `${String(campo)} inválido.` });
    }
    Object.assign(data, { [campo]: campo === 'nome' || campo === 'principioAtivo' || campo === 'fabricante' ? valor.trim() : valor });
  }

  if (categoria !== undefined) {
    if (typeof categoria !== 'string' || !CATEGORIAS_VALIDAS.includes(categoria)) {
      return res.status(400).json({ erro: 'Categoria inválida.' });
    }
    data.categoria = categoria as Categoria;
  }
  if (carenciaDias !== undefined) {
    if (!Number.isInteger(carenciaDias) || carenciaDias < 0) return res.status(400).json({ erro: 'carenciaDias inválido.' });
    data.carenciaDias = carenciaDias;
  }

  const numericos: Array<['preco' | 'intervaloSemChuvaHoras' | 'tempMinima' | 'tempMaxima' | 'umidadeMinima' | 'ventoMaximo', unknown]> = [
    ['preco', preco],
    ['intervaloSemChuvaHoras', intervaloSemChuvaHoras],
    ['tempMinima', tempMinima],
    ['tempMaxima', tempMaxima],
    ['umidadeMinima', umidadeMinima],
    ['ventoMaximo', ventoMaximo],
  ];
  for (const [campo, valor] of numericos) {
    if (valor === undefined) continue;
    if (valor === null && ['preco', 'tempMinima', 'tempMaxima', 'umidadeMinima', 'ventoMaximo'].includes(campo)) {
      Object.assign(data, { [campo]: null });
      continue;
    }
    if (typeof valor !== 'number' || !Number.isFinite(valor) || valor < 0) {
      return res.status(400).json({ erro: `${String(campo)} deve ser um número válido maior ou igual a zero.` });
    }
    if (campo === 'umidadeMinima' && valor > 100) return res.status(400).json({ erro: 'umidadeMinima deve estar entre 0 e 100.' });
    Object.assign(data, { [campo]: valor });
  }
  if (sensibilidadeNebulosidade !== undefined) {
    if (typeof sensibilidadeNebulosidade !== 'boolean') return res.status(400).json({ erro: 'sensibilidadeNebulosidade deve ser booleano.' });
    data.sensibilidadeNebulosidade = sensibilidadeNebulosidade;
  }
  if (typeof tempMinima === 'number' && typeof tempMaxima === 'number' && tempMinima > tempMaxima) {
    return res.status(400).json({ erro: 'tempMinima deve ser menor ou igual a tempMaxima.' });
  }
  if (Object.keys(data).length === 0) return res.status(400).json({ erro: 'Informe ao menos um campo para atualizar.' });

  try {
    const produto = await prisma.produto.update({ where: { id: req.params.id }, data });
    return res.json(produto);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return res.status(409).json({ erro: 'Já existe um produto com esse nome.' });
    }
    console.error('Erro ao atualizar produto:', error);
    return res.status(500).json({ erro: 'Não foi possível atualizar o produto.' });
  }
});

produtoRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.produto.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ erro: 'Produto não encontrado.' });
    }
    console.error('Erro ao excluir produto:', error);
    return res.status(500).json({ erro: 'Não foi possível excluir o produto.' });
  }
});

// Cadastra um novo produto, com os parâmetros técnicos vindos da bula/Agrofit.
produtoRoutes.post('/', async (req, res) => {
  const {
    nome,
    descricao,
    preco,
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
  if (descricao != null && typeof descricao !== 'string') {
    return res.status(400).json({ erro: 'descricao deve ser um texto.' });
  }
  if (preco != null && (typeof preco !== 'number' || !Number.isFinite(preco) || preco < 0)) {
    return res.status(400).json({ erro: 'preco deve ser um número maior ou igual a zero.' });
  }

  const produto = await prisma.produto.create({
    data: {
      nome: nome.trim(),
      descricao: descricao ?? null,
      preco: preco ?? null,
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
