import type { CategoriaProduto } from './api';

export const AGROFIT_URL = 'https://agrofit.agricultura.gov.br/agrofit_cons/principal_agrofit_cons';

export const GUIAS_DEFENSIVOS: Record<CategoriaProduto, {
  indicacao: string;
  periodo: string;
  cuidados: string;
}> = {
  HERBICIDA: {
    indicacao: 'Manejo de plantas daninhas. Cultura, espécie-alvo e método de aplicação devem constar na bula aprovada.',
    periodo: 'Varia conforme pré ou pós-emergência e o estádio da cultura e das plantas daninhas. Confira a janela específica na bula.',
    cuidados: 'Reduza o risco de deriva, proteja culturas vizinhas e siga na íntegra a bula, o receituário e os EPIs indicados.',
  },
  INSETICIDA: {
    indicacao: 'Controle de insetos identificados na cultura e nas condições autorizadas para o produto.',
    periodo: 'Considere o monitoramento da praga, o nível de ação e o intervalo autorizado na bula e no receituário.',
    cuidados: 'Proteja polinizadores e organismos não alvo; respeite reentrada, intervalo de segurança e EPIs da bula.',
  },
  FUNGICIDA: {
    indicacao: 'Manejo de doenças específicas, apenas nas culturas e alvos descritos na bula registrada.',
    periodo: 'O momento depende da doença, do monitoramento e da estratégia prevista na bula e no receituário.',
    cuidados: 'Alterne modos de ação conforme orientação técnica; respeite intervalos, reentrada e EPIs indicados.',
  },
  ACARICIDA: {
    indicacao: 'Manejo de ácaros identificados na cultura e nas condições autorizadas para o produto.',
    periodo: 'Depende da espécie, do monitoramento e do estádio sensível descrito na bula e no receituário.',
    cuidados: 'Confirme o alvo antes do uso; respeite dose, intervalo, reentrada e EPIs exatamente como indicados na bula.',
  },
  NEMATICIDA: {
    indicacao: 'Manejo de nematoides identificados no solo ou nas raízes, conforme culturas e alvos registrados.',
    periodo: 'O momento e a forma de aplicação dependem da cultura, do alvo e da bula aprovada.',
    cuidados: 'Confirme o diagnóstico e siga as restrições de uso, proteção e intervalo descritas na bula.',
  },
  OUTROS: {
    indicacao: 'Consulte a finalidade e os alvos autorizados no registro específico do produto.',
    periodo: 'Não há período geral para esta categoria; siga a bula aprovada e o receituário agronômico.',
    cuidados: 'Confirme os riscos, os EPIs e as restrições de uso no rótulo e na bula registrados.',
  },
};

export const NOMES_CATEGORIAS: Record<CategoriaProduto, string> = {
  HERBICIDA: 'Herbicida',
  INSETICIDA: 'Inseticida',
  FUNGICIDA: 'Fungicida',
  ACARICIDA: 'Acaricida',
  NEMATICIDA: 'Nematicida',
  OUTROS: 'Outros',
};