# EspalhaAGRO— Assistente de Janela de Pulverização

> Projeto desenvolvido para a disciplina de **Programação IV** — Universidade do Oeste de Santa Catarina (UNOESC)
> Professor: Roberson Junior Fernandes Alves | Semestre: 2026/02

## 👥 Time

| Nome | Função |
|---|---|
| Cauana Rosin | Full Stack |
| Natani Gayardo |Banco de dados /front-end|

## 🎯 Descrição do projeto

O **EspalhaAGRO** é um sistema web que ajuda produtores rurais — especialmente quem está iniciando na função de pulverização (troca de responsável na fazenda, novo funcionário, sucessão familiar) — a decidir **quando é seguro aplicar defensivos agrícolas**.

Em vez de o produtor precisar interpretar sozinho a bula técnica e cruzar isso manualmente com o clima do dia, o sistema:

1. Mantém um cadastro de produtos com os parâmetros técnicos extraídos da bula / [Agrofit (MAPA)](https://agrofit.agricultura.gov.br/) — categoria do produto, sensibilidade à nebulosidade, carência de chuva pós-aplicação.
2. Cruza esses parâmetros com as condições climáticas atuais e a previsão das próximas horas para a localização da propriedade.
3. Retorna uma resposta clara: **pode aplicar agora, ou é melhor esperar — e por quê.**

### ⚠️ Escopo e limitações (importante)

Este é um projeto acadêmico. Os dados técnicos de produtos cadastrados **são de exemplo, extraídos de fontes públicas (Agrofit/MAPA)** apenas para fins de demonstração. O sistema **não substitui receituário agronômico nem orientação de um engenheiro agrônomo**. Antes de qualquer uso real em campo, os dados técnicos precisariam de validação profissional.

## ⚙️ Stack utilizada

- **Frontend:** Next.js (TypeScript)
- **Backend:** Node.js + Express (TypeScript)
- **ORM / Banco:** Prisma + PostgreSQL
- **API externa:** [Open-Meteo](https://open-meteo.com/) (dados climáticos, gratuita, sem necessidade de chave de API)

> A escolha da stack seguiu a sugestão da disciplina (TS + Prisma). Optamos por Express no lugar de NestJS para manter o backend enxuto dentro do prazo desta primeira entrega.

## 📦 Estrutura do projeto

```
agro-mvp/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   └── schema.prisma
│   └── src/
│       └── main.ts
└── frontend/
    ├── package.json
    ├── tsconfig.json
    └── src/
        ├── pages/
        │   └── index.tsx
        └── styles/
            └── globals.css
```

## 🚀 Como rodar o projeto

### Pré-requisitos
- Node.js 18+
- PostgreSQL instalado localmente (ou Docker)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# edite o .env com a URL do seu banco PostgreSQL
npx prisma migrate dev --name init
npm run dev
```

O backend sobe em `http://localhost:3333`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

O frontend sobe em `http://localhost:3000`.

> **Nota:** nesta primeira entrega (Kickoff Estrutural), frontend e backend **não estão integrados** — cada um roda e é validado separadamente, conforme orientação da atividade.

## 🗂️ Modelo de dados (resumo)

- **Propriedade** — dados da fazenda e localização (usada para buscar o clima)
- **Produto** — produto fitossanitário cadastrado com parâmetros técnicos da bula
- **ConsultaAplicacao** — histórico de consultas feitas pelo produtor (clima no momento + resultado)

Detalhes completos em `backend/prisma/schema.prisma`.

## 📋 Próximos passos

Ver aba **Issues** deste repositório.
