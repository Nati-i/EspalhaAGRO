
# 🌾 EspalhaAgro — Assistente de Janela de Pulverização

> Projeto desenvolvido para a disciplina de **Programação IV** — Universidade do Oeste de Santa Catarina (UNOESC)
> Professor: Roberson Junior Fernandes Alves | Semestre: 2026/02

## 🔗 Links da aplicação

* **Frontend (aplicação online):**https://espalha-agro-kpz5-eabm3af2w-natani.vercel.app/
* **Backend (API):** https://espalhaagro.onrender.com/
* **Vídeo de apresentação:** 

## 👥 Integrantes do time

| Nome | Função |
|---|---|
| Natani Gabriela Gayardo | Frontend/ Banco de dados |
| Cauana Ghizzi Rosin | Fullstack |

## 🎯 Descrição do projeto

O **EspalhaAgro** é um sistema web que ajuda produtores rurais — especialmente quem está iniciando na função de pulverização (troca de responsável na fazenda, novo funcionário, sucessão familiar) — a decidir quando é seguro aplicar defensivos agrícolas.

O produtor não precisa saber nenhum parâmetro técnico: ele busca o produto por nome ou categoria (herbicida, inseticida, fungicida, acaricida) num catálogo já cadastrado — como uma **bula virtual**, com indicação de uso, período de aplicação e cuidados essenciais. O sistema cruza esses parâmetros técnicos com o clima real da propriedade (vento, temperatura, umidade, nebulosidade e previsão de chuva, via Open-Meteo) e responde de forma direta: pode aplicar agora, ou é melhor esperar — e por quê.

### ⚠️ Escopo e limitações

Projeto acadêmico. Os produtos do catálogo são exemplos de demonstração, com dados técnicos de referência pública (Agrofit/MAPA). O sistema **não substitui receituário agronômico nem orientação de um engenheiro agrônomo**.

## 🛠️ Tecnologias utilizadas

* **Frontend:** Next.js (TypeScript), design próprio (sem biblioteca de UI)
* **Backend:** Node.js + Express (TypeScript)
* **Banco de dados & ORM:** PostgreSQL (Supabase) + Prisma ORM
* **Clima:** API gratuita Open-Meteo (sem necessidade de chave)
* **Hospedagem:** Render (backend) e Vercel (frontend)
* **Testes:** Vitest (testes unitários da lógica de decisão)

## 🗂️ Entidades e operações CRUD

| Entidade | Descrição | Create | Read | Update | Delete |
|---|---|---|---|---|---|
| **Propriedade** | Fazenda/área do produtor, com localização | ✅ | ✅ | ✅ | ✅ |
| **Produto** | Catálogo de defensivos com a "bula virtual" | ✅ | ✅ | ✅ | ✅ |
| **ConsultaAplicacao** | Histórico de consultas (clima + resultado) | ✅ | ✅ | — | ✅ |

> Consultas não são editáveis por natureza (são um registro histórico do que foi perguntado em um momento específico), mas podem ser excluídas.

## 📦 Estrutura do projeto

```
espalhaagro/
├── README.md
├── .gitignore
├── backend/
│   ├── package.json / tsconfig.json / .env.example
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.ts          # popula o catálogo de produtos de exemplo
│   │   └── migrations/
│   └── src/
│       ├── main.ts
│       ├── lib/prisma.ts
│       ├── services/
│       │   ├── weather.service.ts
│       │   └── decisao.service.ts
│       └── routes/
│           ├── propriedade.routes.ts
│           ├── produto.routes.ts
│           └── consulta.routes.ts
└── frontend/
    ├── package.json / tsconfig.json / .env.example
    └── src/
        ├── components/Header.tsx
        ├── lib/api.ts
        └── pages/
            ├── index.tsx       # tela principal (clima + bula virtual)
            ├── gerenciar.tsx
            ├── propriedades.tsx
            └── produtos.tsx
```

## 🚀 Como executar o projeto localmente

### Pré-requisitos

* Node.js 18+
* Uma instância PostgreSQL (local, Docker, ou Supabase)

### 1. Clonar o repositório

```bash
git clone https://github.com/Nati-i/EspalhaAGRO.git
cd EspalhaAGRO
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env
# edite o .env com a sua DATABASE_URL (local ou Supabase)
npx prisma migrate dev
npx prisma db seed      # popula o catálogo de produtos de exemplo
npm run dev             # http://localhost:3333
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev             # http://localhost:3000
```

### 4. Rodar os testes (backend)

```bash
cd backend
npm test
```

## 🔌 Rotas da API

| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | Verifica se o servidor está no ar |
| GET | `/propriedades` | Lista propriedades |
| POST | `/propriedades` | Cadastra propriedade |
| PUT | `/propriedades/:id` | Atualiza propriedade |
| DELETE | `/propriedades/:id` | Remove propriedade |
| GET | `/produtos?q=&categoria=` | Busca produtos do catálogo por nome/categoria |
| POST | `/produtos` | Cadastra produto (uso avançado) |
| PUT | `/produtos/:id` | Atualiza produto |
| DELETE | `/produtos/:id` | Remove produto |
| GET | `/consultas` | Histórico de consultas |
| POST | `/consultas` | Consulta clima + decide se pode aplicar |
| DELETE | `/consultas/:id` | Remove consulta do histórico |

## 📝 Licença

Projeto acadêmico sem fins comerciais, desenvolvido para a disciplina de Programação IV (UNOESC).
