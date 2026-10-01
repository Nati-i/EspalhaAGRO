import { Router } from 'express';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { buscarClima } from '../services/weather.service';
import { decidirAplicacao } from '../services/decisao.service';

export const consultaRoutes = Router();

consultaRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.consultaAplicacao.delete({ where: { id: req.params.id } });
    return res.status(204).send();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      return res.status(404).json({ erro: 'Consulta não encontrada.' });
    }
    console.error('Erro ao excluir consulta:', error);
    return res.status(500).json({ erro: 'Não foi possível excluir a consulta.' });
  }
});

// Busca o clima da propriedade sem exigir um produto ou gerar uma decisão.
consultaRoutes.get('/clima', async (req, res) => {
  const propriedadeId = req.query.propriedadeId;
  const latitudeQuery = req.query.latitude;
  const longitudeQuery = req.query.longitude;

  let latitude: number;
  let longitude: number;
  if (typeof latitudeQuery === 'string' && typeof longitudeQuery === 'string') {
    latitude = Number(latitudeQuery);
    longitude = Number(longitudeQuery);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 || !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      return res.status(400).json({ erro: 'Latitude ou longitude inválida.' });
    }
  } else if (typeof propriedadeId === 'string' && propriedadeId.length > 0) {
    const propriedade = await prisma.propriedade.findUnique({ where: { id: propriedadeId } });
    if (!propriedade) return res.status(404).json({ erro: 'Propriedade não encontrada.' });
    latitude = propriedade.latitude;
    longitude = propriedade.longitude;
  } else {
    return res.status(400).json({ erro: 'Informe latitude e longitude ou propriedadeId.' });
  }

  try {
    const clima = await buscarClima(latitude, longitude);
    return res.json(clima);
  } catch (erro) {
    console.error('Erro ao consultar clima (Open-Meteo):', erro);
    return res.status(502).json({ erro: 'Não foi possível consultar o clima agora. Tente novamente em instantes.' });
  }
});

// Lista o histórico de consultas já feitas.
consultaRoutes.get('/', async (_req, res) => {
  const consultas = await prisma.consultaAplicacao.findMany({
    orderBy: { createdAt: 'desc' },
    include: { produto: true },
  });
  res.json(consultas);
});

// Faz uma nova consulta: busca o clima real da propriedade,
// aplica a lógica de decisão e salva o resultado no histórico.
consultaRoutes.post('/', async (req, res) => {
  const { produtoId, latitude, longitude, temperatura, umidade, vento, chuvaPrevista, nublado = false } = req.body;

  const valoresClimaticos = [latitude, longitude, temperatura, umidade, vento, chuvaPrevista];
  if (typeof produtoId !== 'string' || valoresClimaticos.some((valor) => typeof valor !== 'number' || !Number.isFinite(valor))) {
    return res.status(400).json({
      erro: 'Campos obrigatórios: produtoId, latitude, longitude, temperatura, umidade, vento e chuvaPrevista.',
    });
  }
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    return res.status(400).json({ erro: 'Latitude ou longitude inválida.' });
  }

  const produto = await prisma.produto.findUnique({ where: { id: produtoId } });

  if (!produto) {
    return res.status(404).json({ erro: 'Produto não encontrado.' });
  }

  if (umidade < 0 || umidade > 100 || vento < 0 || chuvaPrevista < 0) {
    return res.status(400).json({ erro: 'Umidade, vento ou previsão de chuva fora do intervalo válido.' });
  }

  const clima = {
    temperaturaC: temperatura,
    umidadePct: umidade,
    ventoKmh: vento,
    chuvaPrevistaH: chuvaPrevista,
    nublado: typeof nublado === 'boolean' ? nublado : false,
  };

  const decisao = decidirAplicacao(produto, clima);

  try {
    const consulta = await prisma.consultaAplicacao.create({
      data: {
        produtoId,
        latitude,
        longitude,
        temperatura: clima.temperaturaC,
        umidade: clima.umidadePct,
        vento: clima.ventoKmh,
        chuvaPrevista: clima.chuvaPrevistaH,
        statusRecomendacao: decisao.statusRecomendacao,
      },
    });

    res.status(201).json({ ...consulta, motivo: decisao.motivo, clima });
  } catch (erro) {
    console.error('Erro ao salvar consulta no banco:', erro);
    res.status(500).json({ erro: 'Clima consultado, mas houve falha ao salvar o histórico.' });
  }
});
