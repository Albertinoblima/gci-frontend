# GCI Frontend

Frontend oficial do sistema GCI (React + Vite).

Este projeto se conecta ao backend Node/Express via API REST e Socket.IO.

## Arquitetura de Publicacao

- Frontend: `app.idialog.com.br`
- Backend: `api.idialog.com.br`

Stack recomendada para menor custo:

- Frontend estatico no GitHub Pages
- Backend no Railway
- Banco existente mantido (sem recriar) se for acessivel externamente

## Requisitos

- Node.js 18+
- npm 9+

## Variaveis de Ambiente

Crie um arquivo `.env` para desenvolvimento local:

```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_BACKEND_URL=http://localhost:3001
```

Em producao, use:

```env
VITE_API_BASE_URL=https://api.idialog.com.br/api
VITE_BACKEND_URL=https://api.idialog.com.br
```

## Scripts

- `npm run dev`: inicia o frontend em desenvolvimento
- `npm run build`: gera build de producao
- `npm run preview`: testa localmente a build
- `npm run lint`: executa ESLint

## Fluxo de Deploy Recomendado

1. Ajustar env de producao no provedor de hospedagem
2. Executar build (`npm run build`)
3. Publicar conteudo estatico
4. Validar login, navegacao SPA e conexao com API
5. Validar conexao Socket.IO em producao

## Pontos de Atencao

1. Evitar valores hardcoded de `localhost` no codigo de producao
2. Garantir CORS liberado apenas para `app.idialog.com.br` no backend
3. Manter segredos fora do repositorio
