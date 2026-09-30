import { describe, expect, it } from 'vitest';
import { horarioLocalParaUnix, horasAteChuva } from './weather.service';

// Simula um dia de previsão hora a hora, como a Open-Meteo retorna:
// o array começa à meia-noite do dia atual (índice 0 = 00:00).
const horarios = Array.from({ length: 24 }, (_, hora) =>
  `2026-09-29T${String(hora).padStart(2, '0')}:00`,
);

describe('horasAteChuva', () => {
  it('conta a partir da hora atual, não do início do array', () => {
    // Agora são 14h. Chove com probabilidade relevante às 17h (índice 17).
    // Distância correta: 17 - 14 = 3 horas.
    const probabilidades = horarios.map((_, hora) => (hora === 17 ? 80 : 10));

    const resultado = horasAteChuva(horarios, probabilidades, '2026-09-29T14:00');

    expect(resultado).toBe(3);
  });

  it('retorna o valor máximo quando não há chuva relevante prevista', () => {
    const probabilidades = horarios.map(() => 5);

    const resultado = horasAteChuva(horarios, probabilidades, '2026-09-29T08:00');

    expect(resultado).toBe(24);
  });

  it('retorna 0 quando a chuva relevante já está na hora atual', () => {
    const probabilidades = horarios.map((_, hora) => (hora === 10 ? 90 : 5));

    const resultado = horasAteChuva(horarios, probabilidades, '2026-09-29T10:00');

    expect(resultado).toBe(0);
  });
});

describe('horarioLocalParaUnix', () => {
  it('converte a hora local da propriedade usando o offset UTC retornado pela API', () => {
    const resultado = horarioLocalParaUnix('2026-09-30T06:00', -5 * 60 * 60);
    const esperado = Date.parse('2026-09-30T11:00:00Z') / 1000;

    expect(resultado).toBe(esperado);
  });
});
