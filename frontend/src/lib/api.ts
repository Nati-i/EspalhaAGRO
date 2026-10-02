
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333').replace(/\/$/, '');

class ApiConnectionError extends Error {
  constructor() {
    super(`Não foi possível conectar ao backend em ${API_URL}. Inicie o servidor do backend e tente novamente.`);
    this.name = 'ApiConnectionError';
  }
}

export const CATEGORIAS_PRODUTO = ['HERBICIDA', 'FUNGICIDA', 'INSETICIDA', 'ACARICIDA', 'NEMATICIDA', 'OUTROS'] as const;
export type CategoriaProduto = (typeof CATEGORIAS_PRODUTO)[number];

export interface Propriedade {
  id: string;
  nome: string;
  cidade: string;
  estado: string;
  latitude: number;
  longitude: number;
}

export interface Produto {
  id: string;
  nome: string;
  principioAtivo: string;
  fabricante: string;
  categoria: CategoriaProduto;
  carenciaDias: number;
  intervaloSemChuvaHoras: number;
  tempMinima: number | null;
  tempMaxima: number | null;
  umidadeMinima: number | null;
  ventoMaximo: number | null;
  sensibilidadeNebulosidade: boolean;
  comoUsar: string | null;
  condicoesClimaInfo: string | null;
}

export interface ClimaAtual {
  ventoKmh: number;
  temperaturaC: number;
  umidadePct: number;
  nublado: boolean;
  chuvaPrevistaH: number;
  nascerDoSol: number;
  porDoSol: number;
}

interface RespostaOpenMeteo {
  utc_offset_seconds: number;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    cloud_cover: number;
  };
  hourly: {
    time: string[];
    precipitation_probability: number[];
  };
  daily: {
    sunrise: string[];
    sunset: string[];
  };
}

async function buscarClimaPorCoordenadas(latitude: number, longitude: number): Promise<ClimaAtual> {
  const parametros = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,cloud_cover',
    hourly: 'precipitation_probability',
    daily: 'sunrise,sunset',
    forecast_days: '2',
    timezone: 'auto',
  });
  const resposta = await fetch(`https://api.open-meteo.com/v1/forecast?${parametros}`);
  if (!resposta.ok) throw new Error('Não foi possível consultar o clima. Tente novamente.');

  const dados = (await resposta.json()) as RespostaOpenMeteo;
  const indiceAgora = dados.hourly.time.findIndex((horario) => horario >= dados.current.time);
  const proximasProbabilidades = dados.hourly.precipitation_probability.slice(Math.max(indiceAgora, 0));
  const indiceChuva = proximasProbabilidades.findIndex((probabilidade) => probabilidade >= 50);
  const chuvaPrevistaH = indiceAgora < 0 || indiceChuva < 0 ? 24 : indiceChuva;
  const converterHorarioSolar = (horario: string) =>
    Math.floor(Date.parse(`${horario}Z`) / 1000 - dados.utc_offset_seconds);

  return {
    temperaturaC: dados.current.temperature_2m,
    umidadePct: dados.current.relative_humidity_2m,
    ventoKmh: dados.current.wind_speed_10m,
    nublado: dados.current.cloud_cover > 70,
    chuvaPrevistaH,
    nascerDoSol: converterHorarioSolar(dados.daily.sunrise[0]),
    porDoSol: converterHorarioSolar(dados.daily.sunset[0]),
  };
}

export interface ConsultaResultado {
  id: string;
  statusRecomendacao: 'COMPATIVEL' | 'ATENCAO' | 'NAO_RECOMENDADO';
  motivo: string;
  clima: Pick<ClimaAtual, 'temperaturaC' | 'umidadePct' | 'ventoKmh' | 'chuvaPrevistaH' | 'nublado'>;
}

export interface DadosConsulta {
  produtoId: string;
  latitude: number;
  longitude: number;
  temperatura: number;
  umidade: number;
  vento: number;
  chuvaPrevista: number;
  nublado: boolean;
}

async function requisitar<T>(caminho: string, opcoes?: RequestInit): Promise<T> {
  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      headers: { 'Content-Type': 'application/json' },
      ...opcoes,
    });
  } catch {
    throw new ApiConnectionError();
  }

  if (!resposta.ok) {
    const erro = await resposta.json().catch(() => ({ erro: 'Erro desconhecido' }));
    throw new Error(erro.erro ?? 'Erro na requisição');
  }

  return resposta.json();
}

export const api = {
  listarPropriedades: () => requisitar<Propriedade[]>('/propriedades'),

  criarPropriedade: (dados: Omit<Propriedade, 'id'>) =>
    requisitar<Propriedade>('/propriedades', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  listarProdutos: async (categoria?: CategoriaProduto) => {
    const caminho = `/api/produtos${categoria ? `?categoria=${encodeURIComponent(categoria)}` : ''}`;
    try {
      return await requisitar<Produto[]>(caminho);
    } catch (erro) {
      if (!(erro instanceof ApiConnectionError)) throw erro;
      await new Promise((resolve) => window.setTimeout(resolve, 500));
      return requisitar<Produto[]>(caminho);
    }
  },

  detalhesProduto: (produtoId: string) =>
    requisitar<Produto>(`/api/produtos/${encodeURIComponent(produtoId)}`),

  climaPorCoordenadas: buscarClimaPorCoordenadas,

  criarProduto: (dados: Omit<Produto, 'id'>) =>
    requisitar<Produto>('/produtos', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),

  consultar: (dados: DadosConsulta) =>
    requisitar<ConsultaResultado>('/api/consultas', {
      method: 'POST',
      body: JSON.stringify(dados),
    }),
};
