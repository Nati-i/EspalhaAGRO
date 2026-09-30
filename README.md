# EspalhaAgro — Assistente de Janela de Pulverização

> Projeto desenvolvido para a disciplina de **Programação IV** — UNOESC
> Professor: Roberson Junior Fernandes Alves | Semestre: 2026/02

## 🎯 Descrição

O **EspalhaAgro** apresenta as condições meteorológicas atuais da propriedade e mantém uma biblioteca de defensivos pesquisável por nome e categoria. O clima aparece sem exigir a seleção de um produto; a biblioteca oferece um resumo geral da categoria e direciona à consulta oficial da bula.

### ⚠️ Escopo e limitações

Projeto acadêmico. O clima vem da Open-Meteo, não de imagens de satélite. Não há integração automática de bulas com o Agrofit: os textos por categoria são gerais, não substituem a bula aprovada ou o receituário, e o sistema não recomenda aplicação quando faltam parâmetros técnicos confirmados.

## ⚙️ Stack

- **Frontend:** Next.js (TypeScript)
- **Backend:** Node.js + Express (TypeScript)
- **ORM / Banco:** Prisma + PostgreSQL
- **Clima:** [Open-Meteo](https://open-meteo.com/) (API gratuita, sem chave; atualização a cada 10 minutos)

## 📦 Estrutura

```
espalhaagro/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json / tsconfig.json / .env.example
│   ├── prisma/schema.prisma
│   └── src/
│       ├── main.ts              # sobe o servidor e monta as rotas
│       ├── lib/prisma.ts        # instância única do Prisma
│       ├── services/
│       │   ├── weather.service.ts   # clima, previsão de chuva e horários solares
│       │   └── decisao.service.ts   # regra pura: pode/não pode aplicar
│       └── routes/
│           ├── propriedade.routes.ts
│           ├── produto.routes.ts
│           └── consulta.routes.ts
└── frontend/
    ├── package.json / tsconfig.json / .env.example
    └── src/
        ├── lib/api.ts            # todas as chamadas ao backend
        └── pages/
            ├── index.tsx
            ├── propriedades.tsx
            ├── produtos.tsx
            └── gerenciar.tsx
```

## 🚀 Como rodar

### Backend
```bash
cd backend
npm install
cp .env.example .env   # ajuste DATABASE_URL com seu usuário/senha do Postgres
npx prisma db push      # sincroniza schema.prisma com o banco de desenvolvimento
npm run dev             # http://localhost:3333
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev             # http://localhost:3000
```

## 🔌 Rotas do backend

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se o servidor está no ar |
| GET | `/propriedades` | Lista propriedades |
| POST | `/propriedades` | Cadastra propriedade (nome, cidade, estado, latitude, longitude) |
| GET | `/produtos` | Lista produtos |
| POST | `/produtos` | Cadastra produto por nome e categoria; parâmetros técnicos da bula são opcionais |
| GET | `/consultas` | Histórico de consultas |
| POST | `/consultas` | Recebe `propriedadeId` + `produtoId`, busca o clima real e retorna a decisão |
| GET | `/consultas/clima?propriedadeId=...` | Busca as condições meteorológicas atuais sem exigir um produto |

## 🗂️ Fluxo de uso

1. Cadastra a propriedade e permite ao navegador capturar as coordenadas do dispositivo; faça isso próximo à propriedade e confira cidade/UF.
2. A home consulta automaticamente o clima da propriedade selecionada e atualiza os dados a cada 10 minutos. O tema acompanha nascer e pôr do sol informados pela Open-Meteo.
3. Na biblioteca, busca ou cadastra defensivos pelo nome e categoria. Não é necessário inventar valores técnicos; para a bula específica, consulte o registro no Agrofit.
