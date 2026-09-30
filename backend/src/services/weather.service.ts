// Serviço responsável por buscar o clima atual e a previsão de chuva
// na Open-Meteo (API pública e gratuita, sem necessidade de chave).

export interface CondicaoClimatica {
  ventoKmh: number;
  temperaturaC: number;
  umidadePct: number;
  nublado: boolean;
  chuvaPrevistaH: number; // horas até a próxima chuva com probabilidade relevante
  nascerDoSol: number;
  porDoSol: number;
}

interface OpenMeteoResponse {
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

const PROBABILIDADE_CHUVA_RELEVANTE = 50; // %
const HORAS_MAX_PREVISAO = 24; // se não chover nas próximas 24h, consideramos "sem chuva prevista"

export async function buscarClima(
  latitude: number,
  longitude: number,
): Promise<CondicaoClimatica> {
  const baseUrl = process.env.WEATHER_API_BASE_URL ?? 'https://api.open-meteo.com/v1/forecast';

  // timezone=auto é essencial: sem isso, os horários de "hourly" vêm em UTC
  // e "current" no fuso local, o que quebra a comparação entre os dois.
  const url =
    `${baseUrl}?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,cloud_cover` +
    `&hourly=precipitation_probability&daily=sunrise,sunset&forecast_days=2&timezone=auto`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Falha ao consultar clima (status ${response.status})`);
  }

  const data = (await response.json()) as OpenMeteoResponse;

  return {
    ventoKmh: data.current.wind_speed_10m,
    temperaturaC: data.current.temperature_2m,
    umidadePct: data.current.relative_humidity_2m,
    nublado: data.current.cloud_cover > 70,
    chuvaPrevistaH: horasAteChuva(data.hourly.time, data.hourly.precipitation_probability, data.current.time),
    nascerDoSol: horarioLocalParaUnix(data.daily.sunrise[0], data.utc_offset_seconds),
    porDoSol: horarioLocalParaUnix(data.daily.sunset[0], data.utc_offset_seconds),
  };
}

export function horarioLocalParaUnix(horarioLocal: string, offsetUtcSegundos: number): number {
  return Math.floor(Date.parse(`${horarioLocal}Z`) / 1000 - offsetUtcSegundos);
}

/**
 * O array "hourly" da Open-Meteo começa à meia-noite do dia atual, não no
 * horário da consulta. Por isso, antes de contar "quantas horas até chover",
 * é preciso achar em que posição desse array a hora atual (data.current.time)
 * está, e só então procurar a próxima hora com chance relevante de chuva
 * a partir dali.
 */
export function horasAteChuva(
  horarios: string[],
  probabilidadesPorHora: number[],
  horarioAtual: string,
): number {
  const indiceAgora = horarios.findIndex((horario) => horario >= horarioAtual);

  if (indiceAgora === -1) {
    return HORAS_MAX_PREVISAO;
  }

  const indiceChuva = probabilidadesPorHora
    .slice(indiceAgora)
    .findIndex((probabilidade) => probabilidade >= PROBABILIDADE_CHUVA_RELEVANTE);

  if (indiceChuva === -1) {
    return HORAS_MAX_PREVISAO;
  }

  return indiceChuva;
}
