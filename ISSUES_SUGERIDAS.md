# Issues sugeridas — Próximos passos

Copie cada item abaixo como uma Issue separada no GitHub (Aba "Issues" → "New issue").

---

**Título:** Cadastrar produtos de exemplo (seed) com dados do Agrofit
**Descrição:** Popular a tabela `Produto` com 3-4 produtos fitossanitários reais (categoria, sensibilidade à nebulosidade, carência de chuva), usando como fonte o Agrofit (MAPA), para fins de demonstração do MVP.

---

**Título:** Implementar rota de consulta de clima (integração Open-Meteo)
**Descrição:** Criar endpoint no backend que recebe latitude/longitude da propriedade e retorna vento, temperatura, umidade e previsão de chuva das próximas horas.

---

**Título:** Implementar lógica de decisão "pode aplicar / espera"
**Descrição:** Cruzar os parâmetros técnicos do produto (`Produto`) com os dados climáticos retornados para gerar o resultado da `ConsultaAplicacao`, incluindo o motivo textual.

---

**Título:** Criar tela de consulta no frontend
**Descrição:** Tela onde o usuário seleciona a propriedade e o produto, e visualiza o resultado da consulta (pode aplicar / esperar + motivo).

---

**Título:** Cadastro de propriedade no frontend
**Descrição:** Formulário simples para cadastrar nome, cidade/estado e localização (lat/long) da propriedade.

---

**Título:** Integrar frontend e backend
**Descrição:** Conectar as telas do frontend às rotas reais do backend (atualmente rodam de forma independente).

---

**Título:** Adicionar checklist de boas práticas de aplicação
**Descrição:** Exibir, junto ao resultado da consulta, um checklist simples (EPI, calibração do bico, etc.) para reforçar segurança na aplicação.
