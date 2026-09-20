# Controle de Horas para Trello (Power-Up gratuito)

Registre horas em cada cartão (timer ou lançamento manual) e veja um dashboard com o total por pessoa: hoje, semana, mês, total geral, períodos personalizados, por cartão e exportação em CSV.

Custo: R$ 0. Os arquivos são estáticos (hospedagem gratuita) e os dados ficam dentro do próprio Trello.

## Como colocar no ar

### 1. Hospedar os arquivos (GitHub Pages, grátis)
1. Crie um repositório público no GitHub (ex.: `trello-horas`) e envie todos os arquivos desta pasta.
2. Em **Settings > Pages**, escolha a branch `main` e a pasta `/ (root)`.
3. Sua URL será `https://SEU-USUARIO.github.io/trello-horas/`. (Netlify, Cloudflare Pages ou Vercel também servem.)

### 2. Criar o Power-Up
1. Acesse https://trello.com/power-ups/admin e clique em **Create new Power-Up**.
2. Escolha o workspace, dê um nome (ex.: "Controle de Horas") e em **Iframe connector URL** coloque `https://SEU-USUARIO.github.io/trello-horas/index.html`.
3. Na aba **Capabilities**, marque: `board-buttons`, `card-buttons`, `card-badges`, `card-detail-badges`.

### 3. Gerar a API Key (necessária para o dashboard somar todos os cartões)
1. Na página do Power-Up, aba **API Key**, clique em **Generate a new API Key**.
2. Em **Allowed origins**, adicione `https://SEU-USUARIO.github.io`.
3. Copie a API Key, cole em `config.js` (campo `appKey`) e envie a alteração para o GitHub.

### 4. Ativar no quadro
No quadro: **Power-Ups > Adicionar Power-Ups > Custom** e ative "Controle de Horas". Cada pessoa que abrir o dashboard pela primeira vez clica em "Autorizar leitura" (uma vez).

## Como usar
- No cartão, botão **Horas**: inicie/pare o timer, ou lance manualmente (`1h30`, `45min`, `1,5` = 1h30, `90m`). Cada pessoa vê e remove só os próprios lançamentos.
- O cartão mostra o total como badge (e "Timer ativo" enquanto o seu timer roda).
- No topo do quadro, botão **Dashboard de horas**.

## Limites que você deve conhecer
- O Trello permite ~4 KB de dados do Power-Up por cartão. O Power-Up guarda um valor por pessoa por dia; quando o cartão enche, lançamentos com mais de ~90 dias viram resumo mensal (o total é preservado, mas perde o dia exato). Cartões normais dificilmente chegam nisso.
- O dashboard lê os dados por quadro (cada quadro tem o seu dashboard).
- Se duas pessoas salvarem no mesmo cartão no mesmo segundo, um lançamento pode sobrescrever o outro (raro).
- Estrutura dos dados: cartão > `pluginData` > `{"tl":{"u":{"<idMembro>":{"260919":90}}}}` (minutos por dia `yymmdd`).
