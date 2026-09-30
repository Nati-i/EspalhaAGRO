import { describe, expect, it } from 'vitest';
import { decidirAplicacao } from './decisao.service';
import { Produto } from '@prisma/client';

// Produto de exemplo usado como base em todos os testes.
// Cada teste altera só o que precisa pra provocar uma regra específica.
function criarProduto(sobrescritas: Partial<Produto> = {}): Produto {
  return {
    id: 'produto-1',
    nome: 'Produto Teste',
    principioAtivo: 'Ingrediente ativo',
    fabricante: 'Fabricante',
    categoria: 'HERBICIDA',
    carenciaDias: 7,
    intervaloSemChuvaHoras: 4,
    tempMinima: 10,
    tempMaxima: 30,
    umidadeMinima: 50,
    ventoMaximo: 10,
    sensibilidadeNebulosidade: false,
    ...sobrescritas,
  } as Produto;
}

const climaIdeal = {
  ventoKmh: 6,
  temperaturaC: 24,
  umidadePct: 60,
  nublado: false,
  chuvaPrevistaH: 24,
  nascerDoSol: 1_759_211_200,
  porDoSol: 1_759_254_400,
};

describe('decidirAplicacao', () => {
  it('permite aplicar quando todas as condições estão dentro dos parâmetros', () => {
    const resultado = decidirAplicacao(criarProduto(), climaIdeal);
    expect(resultado.statusRecomendacao).toBe('COMPATIVEL');
  });

  it('não recomenda quando a chuva está dentro do intervalo sem chuva', () => {
    const resultado = decidirAplicacao(criarProduto({ intervaloSemChuvaHoras: 8 }), {
      ...climaIdeal,
      chuvaPrevistaH: 4,
    });
    expect(resultado.statusRecomendacao).toBe('NAO_RECOMENDADO');
    expect(resultado.motivo).toMatch(/chuva prevista/i);
  });

  it('não recomenda quando o vento ultrapassa o máximo', () => {
    const resultado = decidirAplicacao(criarProduto({ ventoMaximo: 10 }), {
      ...climaIdeal,
      ventoKmh: 15,
    });
    expect(resultado.statusRecomendacao).toBe('NAO_RECOMENDADO');
    expect(resultado.motivo).toMatch(/vento acima/i);
  });

  it('não recomenda temperatura acima do máximo', () => {
    const resultado = decidirAplicacao(criarProduto({ tempMaxima: 28 }), {
      ...climaIdeal,
      temperaturaC: 31,
    });
    expect(resultado.statusRecomendacao).toBe('NAO_RECOMENDADO');
    expect(resultado.motivo).toMatch(/temperatura acima/i);
  });

  it('não recomenda temperatura abaixo do mínimo', () => {
    const resultado = decidirAplicacao(criarProduto({ tempMinima: 12 }), {
      ...climaIdeal,
      temperaturaC: 8,
    });
    expect(resultado.statusRecomendacao).toBe('NAO_RECOMENDADO');
  });

  it('retorna atenção quando a umidade está próxima do limite mínimo', () => {
    const resultado = decidirAplicacao(criarProduto({ umidadeMinima: 58 }), {
      ...climaIdeal,
    });
    expect(resultado.statusRecomendacao).toBe('ATENCAO');
    expect(resultado.motivo).toMatch(/umidade próxima/i);
  });

  it('retorna atenção quando o vento está próximo do limite máximo', () => {
    const resultado = decidirAplicacao(criarProduto({ ventoMaximo: 10 }), {
      ...climaIdeal,
      ventoKmh: 9,
    });
    expect(resultado.statusRecomendacao).toBe('ATENCAO');
    expect(resultado.motivo).toMatch(/vento próximo/i);
  });

  it('retorna atenção para produto sensível em condição nublada', () => {
    const resultado = decidirAplicacao(criarProduto({ sensibilidadeNebulosidade: true }), {
      ...climaIdeal,
      nublado: true,
    });
    expect(resultado.statusRecomendacao).toBe('ATENCAO');
  });
});
