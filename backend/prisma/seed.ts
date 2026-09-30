import { PrismaClient, Categoria } from '@prisma/client';

const prisma = new PrismaClient();

const produtos = [
  {
    nome: 'Glifosato 480 SL',
    principioAtivo: 'Glifosato',
    fabricante: 'AgroChem',
    categoria: Categoria.HERBICIDA,
    carenciaDias: 14,
    intervaloSemChuvaHoras: 4,
    tempMinima: 15,
    tempMaxima: 30,
    umidadeMinima: 55,
    ventoMaximo: 10,
    comoUsar: 'Aplicar em pós-emergência das plantas daninhas em área total ou jato dirigido. Evitar deriva em culturas vizinhas suscetíveis.',
    condicoesClimaInfo: 'Ideal aplicar com temperatura entre 15°C e 30°C, umidade superior a 55% e ventos abaixo de 10 km/h.'
  },
  {
    nome: '2,4-D Amina 840',
    principioAtivo: '2,4-D',
    fabricante: 'CropProtect',
    categoria: Categoria.HERBICIDA,
    carenciaDias: 20,
    intervaloSemChuvaHoras: 6,
    tempMinima: 10,
    tempMaxima: 28,
    umidadeMinima: 60,
    ventoMaximo: 8,
    comoUsar: 'Indicado para controle de plantas daninhas de folhas largas em pastagens e culturas de milho/soja pré-plantio.',
    condicoesClimaInfo: 'Não aplicar em dias muito quentes (>28°C) ou com ventos fortes para evitar volatilização e deriva.'
  },
  {
    nome: 'Atrazina 500 SC',
    principioAtivo: 'Atrazina',
    fabricante: 'AgroSol',
    categoria: Categoria.HERBICIDA,
    carenciaDias: 30,
    intervaloSemChuvaHoras: 4,
    tempMinima: 12,
    tempMaxima: 32,
    umidadeMinima: 50,
    ventoMaximo: 12,
    comoUsar: 'Herbicida seletivo para cultura do milho e sorgo. Aplicar na pré-emergência ou pós-emergência precoce.',
    condicoesClimaInfo: 'Requer solo com boa umidade para melhor incorporação e eficiência.'
  },
  {
    nome: 'Clethodim 240 EC',
    principioAtivo: 'Clethodim',
    fabricante: 'VerdeVida',
    categoria: Categoria.HERBICIDA,
    carenciaDias: 14,
    intervaloSemChuvaHoras: 2,
    tempMinima: 15,
    tempMaxima: 30,
    umidadeMinima: 55,
    ventoMaximo: 10,
    comoUsar: 'Graminicida pós-emergente seletivo para soja, feijão e algodão.',
    condicoesClimaInfo: 'Adicionar óleo mineral à calda para otimizar absorção foliar.'
  },
  {
    nome: 'Paraquat 200 SL',
    principioAtivo: 'Paraquat',
    fabricante: 'AgroDefensa',
    categoria: Categoria.HERBICIDA,
    carenciaDias: 7,
    intervaloSemChuvaHoras: 1,
    tempMinima: 10,
    tempMaxima: 35,
    umidadeMinima: 40,
    ventoMaximo: 10,
    comoUsar: 'Herbicida de contato de ação não seletiva e dessecação pré-colheita.',
    condicoesClimaInfo: 'Ação acelerada por alta luminosidade solar.'
  },
  {
    nome: 'Azoxistrobina + Ciproconazol',
    principioAtivo: 'Azoxistrobina + Ciproconazol',
    fabricante: 'AgroShield',
    categoria: Categoria.FUNGICIDA,
    carenciaDias: 21,
    intervaloSemChuvaHoras: 3,
    tempMinima: 15,
    tempMaxima: 28,
    umidadeMinima: 60,
    ventoMaximo: 10,
    comoUsar: 'Fungicida sistêmico para controle de ferrugem e manchas foliares na soja e milho.',
    condicoesClimaInfo: 'Evitar aplicação em horários de pico de calor e baixa umidade relativa.'
  },
  {
    nome: 'Mancozeb 800 WP',
    principioAtivo: 'Mancozeb',
    fabricante: 'BioProtect',
    categoria: Categoria.FUNGICIDA,
    carenciaDias: 14,
    intervaloSemChuvaHoras: 4,
    tempMinima: 10,
    tempMaxima: 30,
    umidadeMinima: 50,
    ventoMaximo: 12,
    comoUsar: 'Fungicida multissítio protetor. Excelente para manejo de resistência.',
    condicoesClimaInfo: 'Manter cobertura uniforme na folhagem. Evitar aplicar antes de chuvas fortes.'
  },
  {
    nome: 'Tebuconazol 200 EC',
    principioAtivo: 'Tebuconazol',
    fabricante: 'AgroCare',
    categoria: Categoria.FUNGICIDA,
    carenciaDias: 30,
    intervaloSemChuvaHoras: 2,
    tempMinima: 12,
    tempMaxima: 30,
    umidadeMinima: 55,
    ventoMaximo: 10,
    comoUsar: 'Fungicida sistêmico do grupo dos triazóis para trigo, cevada e soja.',
    condicoesClimaInfo: 'Boa absorção foliar em condições de umidade moderada.'
  },
  {
    nome: 'Piraclostrobina 250 EC',
    principioAtivo: 'Piraclostrobina',
    fabricante: 'CropHealth',
    categoria: Categoria.FUNGICIDA,
    carenciaDias: 14,
    intervaloSemChuvaHoras: 2,
    tempMinima: 15,
    tempMaxima: 30,
    umidadeMinima: 50,
    ventoMaximo: 10,
    comoUsar: 'Fungicida estrobirulina com efeito fisiológico positivo nas plantas.',
    condicoesClimaInfo: 'Aplicar preventivamente antes da instalação de doenças.'
  },
  {
    nome: 'Copper Oxychloride 500',
    principioAtivo: 'Oxicloreto de Cobre',
    fabricante: 'TerraVerde',
    categoria: Categoria.FUNGICIDA,
    carenciaDias: 7,
    intervaloSemChuvaHoras: 4,
    tempMinima: 10,
    tempMaxima: 28,
    umidadeMinima: 50,
    ventoMaximo: 12,
    comoUsar: 'Fungicida e bactericida cúprico de contato para hortifrúti e café.',
    condicoesClimaInfo: 'Evitar aplicação em períodos de seca prolongada.'
  },
  {
    nome: 'Imidacloprido 700 WG',
    principioAtivo: 'Imidacloprido',
    fabricante: 'InsectaKill',
    categoria: Categoria.INSETICIDA,
    carenciaDias: 21,
    intervaloSemChuvaHoras: 3,
    tempMinima: 15,
    tempMaxima: 32,
    umidadeMinima: 50,
    ventoMaximo: 10,
    comoUsar: 'Inseticida neonicotinoide sistêmico para controle de pragas sugadoras (sugadores/pulgões/cigarrinhas).',
    condicoesClimaInfo: 'Evitar pulverização em horários de visitação de polinizadores (abelhas).'
  },
  {
    nome: 'Lambda-Cialotrina 50 EC',
    principioAtivo: 'Lambda-Cialotrina',
    fabricante: 'AgroGuard',
    categoria: Categoria.INSETICIDA,
    carenciaDias: 15,
    intervaloSemChuvaHoras: 2,
    tempMinima: 10,
    tempMaxima: 28,
    umidadeMinima: 55,
    ventoMaximo: 8,
    comoUsar: 'Inseticida piretroide de choque e repulsa para controle de lagartas e percevejos.',
    condicoesClimaInfo: 'Preferir aplicações ao final da tarde para evitar degradação por raios UV.'
  },
  {
    nome: 'Chlorantraniliprole 200 SC',
    principioAtivo: 'Clorantraniliprole',
    fabricante: 'BioAgro',
    categoria: Categoria.INSETICIDA,
    carenciaDias: 14,
    intervaloSemChuvaHoras: 2,
    tempMinima: 12,
    tempMaxima: 35,
    umidadeMinima: 45,
    ventoMaximo: 12,
    comoUsar: 'Inseticida da classe das diamidas, highly seletivo aos inimigos naturais.',
    condicoesClimaInfo: 'Excelente estabilidade e resistência à lavagem por chuvas.'
  },
  {
    nome: 'Acefato 750 SP',
    principioAtivo: 'Acefato',
    fabricante: 'PestControl',
    categoria: Categoria.INSETICIDA,
    carenciaDias: 21,
    intervaloSemChuvaHoras: 4,
    tempMinima: 15,
    tempMaxima: 30,
    umidadeMinima: 55,
    ventoMaximo: 10,
    comoUsar: 'Organofosforado sistêmico para controle de percevejos e lagartas na soja e algodão.',
    condicoesClimaInfo: 'Usar com umidade relativa adequada para garantir boa translocação na planta.'
  },
  {
    nome: 'Spinosad 480 SC',
    principioAtivo: 'Espinosade',
    fabricante: 'EcoAgro',
    categoria: Categoria.INSETICIDA,
    carenciaDias: 3,
    intervaloSemChuvaHoras: 2,
    tempMinima: 10,
    tempMaxima: 32,
    umidadeMinima: 50,
    ventoMaximo: 10,
    comoUsar: 'Inseticida de origem biológica para controle de tripes, lagartas e moscas-das-frutas.',
    condicoesClimaInfo: 'Baixo impacto ambiental e alta seletividade.'
  }
];

async function main() {
  console.log('🌱 Populando o banco de dados com 15 defensivos agrícolas...');

  for (const produto of produtos) {
    await prisma.produto.upsert({
      where: { nome: produto.nome },
      update: produto,
      create: produto,
    });
  }

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🔌 Conexão encerrada.');
  });