import { Produto, StatusRecomendacao } from '@prisma/client';
import { CondicaoClimatica } from './weather.service';

export interface ResultadoDecisao {
  statusRecomendacao: StatusRecomendacao;
  motivo: string;
}

/**
 * Decide se é seguro aplicar o produto agora, com base nas condições
 * climáticas e nos parâmetros técnicos cadastrados (vindos da bula/Agrofit).
 *
 * Função pura: não acessa banco nem API externa, só recebe os dados
 * já carregados e devolve o resultado. Isso facilita testar cada regra
 * isoladamente.
 */
export function decidirAplicacao(
  produto: Produto,
  clima: Pick<CondicaoClimatica, 'ventoKmh' | 'temperaturaC' | 'umidadePct' | 'nublado' | 'chuvaPrevistaH'>,
): ResultadoDecisao {
  const impedimentos: string[] = [];
  const alertas: string[] = [];

  if (clima.chuvaPrevistaH < produto.intervaloSemChuvaHoras) {
    impedimentos.push(`Chuva prevista em ${clima.chuvaPrevistaH}h; o intervalo cadastrado é ${produto.intervaloSemChuvaHoras}h.`);
  }
  if (produto.ventoMaximo != null && clima.ventoKmh > produto.ventoMaximo) {
    impedimentos.push(`Vento acima do limite cadastrado (${produto.ventoMaximo} km/h).`);
  } else if (produto.ventoMaximo != null && clima.ventoKmh >= produto.ventoMaximo * 0.85) {
    alertas.push('Vento próximo do limite máximo cadastrado.');
  }
  if (produto.tempMaxima != null && clima.temperaturaC > produto.tempMaxima) {
    impedimentos.push(`Temperatura acima do limite cadastrado (${produto.tempMaxima}°C).`);
  }
  if (produto.tempMinima != null && clima.temperaturaC < produto.tempMinima) {
    impedimentos.push(`Temperatura abaixo do limite cadastrado (${produto.tempMinima}°C).`);
  }
  if (produto.umidadeMinima != null && clima.umidadePct < produto.umidadeMinima) {
    alertas.push(`Umidade abaixo do mínimo cadastrado (${produto.umidadeMinima}%).`);
  } else if (produto.umidadeMinima != null && clima.umidadePct <= produto.umidadeMinima + 5) {
    alertas.push('Umidade próxima do limite mínimo cadastrado.');
  }
  if (produto.sensibilidadeNebulosidade && clima.nublado) {
    alertas.push('Nebulosidade pode afetar este produto conforme o cadastro.');
  }

  if (impedimentos.length > 0) {
    return { statusRecomendacao: StatusRecomendacao.NAO_RECOMENDADO, motivo: impedimentos.join(' ') };
  }
  if (alertas.length > 0) {
    return { statusRecomendacao: StatusRecomendacao.ATENCAO, motivo: alertas.join(' ') };
  }
  return {
    statusRecomendacao: StatusRecomendacao.COMPATIVEL,
    motivo: 'Condições dentro dos limites técnicos cadastrados.',
  };
}
