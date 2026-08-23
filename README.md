# RPromo — Fichas Cadastrais

App para a equipe da RPromo cadastrar e gerenciar pessoas (trabalhadores temporários).
Pessoas preenchem uma **ficha pública**; a equipe usa um **painel administrativo** para
filtrar por região/idade/status, marcar quem "não chamar novamente", gerar PDF e chamar no
WhatsApp.

O backend é uma **API .NET 8** (Minimal API + EF Core + SQLite), com autenticação JWT real para
o painel e fotos salvas em disco local. Pensada pra ser trocável: trocar SQLite por PostgreSQL
depois é só mudar o provider/connection string, sem tocar em lógica de negócio.

## Arquitetura

```
Angular 20 (frontend)                         API .NET 8 (api/RPromo.Api)
  └── PeopleRepository (interface)             ├── /api/auth/login   (público)
        └── ApiPeopleRepository  ───HTTP───►    ├── /api/people       (list: auth · create: público)
              (JWT no header via interceptor)   ├── /api/people/{id}         (auth)
                                                 ├── /api/people/{id}/status  (auth)
                                                 ├── /api/people/{id}/do-not-call (auth)
                                                 └── /api/photos       (público)
                                                       ├── EF Core → SQLite (rpromo.db)
                                                       └── wwwroot/uploads/photos (fotos)
```

- **Trocar o backend depois** = criar outra implementação de `PeopleRepository` e mudar
  **uma linha** em [`app.config.ts`](frontend/src/app/app.config.ts). Nada mais no app precisa mudar.
- Estado no front via **Angular signals** ([`PeopleStore`](frontend/src/app/core/data/people-store.ts)).
- `apps-script/` fica no repo como histórico (implementação anterior, via Google Sheets/Apps Script).

### Estrutura
```
api/
  RPromo.Api/            # API .NET 8 — Minimal API, EF Core, JWT
    Domain/              # Person, Child
    Contracts/           # PersonInput e outros DTOs de request/response
    Data/                # AppDbContext (EF Core)
    Services/            # IPeopleRepository, IPhotoStorage, ITokenService, AdminCredentials
    Endpoints/            # PeopleEndpoints, AuthEndpoints, PhotoEndpoints
  RPromo.Api.Tests/       # xUnit — repositório, JWT, credenciais, endpoints (WebApplicationFactory)
apps-script/              # Backend anterior (histórico): Code.gs + instruções de deploy
frontend/
  src/app/
    core/
      models/            # Person, enums, helpers (ageFromBirthDate, …)
      data/              # PeopleRepository, ApiPeopleRepository, PeopleStore
      services/          # PhotoService (resize→base64), PdfService
      auth/              # AuthService (login JWT real) + authGuard + authInterceptor
      utils/             # formatters (CPF, telefone, datas)
    features/
      registration/      # Ficha pública  (/register)
      dashboard/         # Painel admin    (/dashboard, protegido)
      login/             # Login           (/login)
    shared/components/navbar/
```

## Como rodar

### 1. API
```bash
cd api
dotnet run --project RPromo.Api --urls http://localhost:5219
```
Na primeira execução cria `rpromo.db` (SQLite) automaticamente. Usuário/senha padrão de dev:
`admin` / `rpromo` (configurável em [`appsettings.json`](api/RPromo.Api/appsettings.json) —
em produção, prefira setar `Admin:PasswordHash` via variável de ambiente/user-secrets em vez do
`Admin:Password` em texto puro).

Swagger em `http://localhost:5219/swagger`.

### 2. Frontend
```bash
cd frontend
npm install
npm start          # http://localhost:4200
npm run build      # build de produção em dist/
```

A URL da API fica em [`src/environments/environment.ts`](frontend/src/environments/environment.ts)
(`apiUrl`, default `http://localhost:5219`).

## Rotas

| Rota         | Acesso   | O que é |
|--------------|----------|---------|
| `/register`  | Público  | Ficha de cadastro (envie o link às pessoas) |
| `/login`     | Público  | Entrada do painel (usuário/senha real via API) |
| `/dashboard` | Protegido | Painel: filtros, "não chamar", PDF, WhatsApp |

## Notas

- **Auth:** login real contra a API, JWT guardado em `sessionStorage`, anexado pelo
  `authInterceptor`; 401 desloga e manda pro `/login`.
- **Fotos:** redimensionadas no navegador antes do upload; salvas em
  `api/RPromo.Api/wwwroot/uploads/photos` e servidas como arquivo estático.
- **Datas** trafegam como string ISO (`yyyy-mm-dd`) ponta a ponta — mesmo formato usado no
  front, sem conversão de tipo no meio do caminho.
