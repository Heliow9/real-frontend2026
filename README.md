# RealEnergy Admin Dashboard

Painel React mobile-first pronto para consumir o backend Express + Prisma + MySQL.

## O que já vem pronto
- login com JWT
- proteção de rotas
- layout administrativo responsivo
- visão geral do dashboard
- gestão inicial da home
- gestão inicial de notícias
- biblioteca de mídia com upload
- leitura do perfil autenticado

## Como usar

### 1. Instale as dependências
```bash
npm install
```

### 2. Configure a API
Crie um arquivo `.env` baseado no `.env.example`:
```env
REACT_APP_API_URL=http://localhost:3333
```

Se o backend estiver no Render, use a URL pública dele.

### 3. Rode o projeto
```bash
npm start
```

## Fluxo de login esperado
A API deve responder em `POST /api/auth/login` com:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "user": {
      "id": 1,
      "name": "Administrador",
      "email": "admin@realenergy.com",
      "roles": ["super_admin"],
      "permissions": ["news.read"]
    }
  }
}
```

## Rotas do painel
- `/login`
- `/dashboard`
- `/conteudo/home`
- `/conteudo/noticias`
- `/midia`
- `/perfil`
- `/configuracoes`

## Próximas integrações
- refresh token automático
- edição de notícia completa
- compliance, transparência, fornecedores e denúncias
- editor rico
- tabelas com filtros e paginação
