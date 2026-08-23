# RPromo — Fichas Cadastrais

App para a equipe da RPromo cadastrar e gerenciar pessoas (trabalhadores temporários).
Pessoas preenchem uma **ficha pública**; a equipe usa um **painel administrativo** para
filtrar por região/idade/status, marcar quem "não chamar novamente", gerar PDF e chamar no
WhatsApp.

O backend é uma **planilha do Google Sheets** (dados) + **Google Drive** (fotos), acessados por
um **Google Apps Script Web App**. Sem servidor para manter e sem credenciais no front-end.

## Arquitetura

```
Angular 20 (frontend)
  └── PeopleRepository (interface)        ← único ponto de troca de backend
        └── SheetsPeopleRepository         ← fala com o Apps Script (HTTP)
              └── Apps Script Web App (/exec)
                    ├── Google Sheets (aba "People")   → dados
                    └── Google Drive (pasta)           → fotos
```

- **Trocar o backend depois** (Firebase, SQL, etc.) = criar outra implementação de
  `PeopleRepository` e mudar **uma linha** em [`app.config.ts`](frontend/src/app/app.config.ts).
  Nada mais no app precisa mudar.
- Estado no front via **Angular signals** ([`PeopleStore`](frontend/src/app/core/data/people-store.ts)).

### Estrutura
```
apps-script/            # Backend: Code.gs + instruções de deploy
frontend/
  src/app/
    core/
      models/           # Person, enums, helpers (ageFromBirthDate, …)
      data/             # PeopleRepository, SheetsPeopleRepository, PeopleStore, mapper
      services/         # PhotoService (resize→base64), PdfService
      auth/             # AuthService (senha no front) + authGuard
      utils/            # formatters (CPF, telefone, datas)
    features/
      registration/     # Ficha pública  (/register)
      dashboard/        # Painel admin    (/dashboard, protegido)
      login/            # Login           (/login)
    shared/components/navbar/
```

## Como rodar

### 1. Backend (uma vez)
Siga [`apps-script/README.md`](apps-script/README.md): criar planilha + pasta no Drive, colar o
`Code.gs`, publicar como Web App e copiar a URL `/exec`.

### 2. Frontend
```bash
cd frontend
npm install
```

Configure [`src/environments/environment.ts`](frontend/src/environments/environment.ts):
```ts
export const environment = {
  production: false,
  webAppUrl: 'https://script.google.com/macros/s/SEU_ID/exec', // do passo 1
  adminPassword: 'sua-senha',                                   // gate do painel
};
```

```bash
npm start          # http://localhost:4200
npm run build      # build de produção em dist/
```

## Rotas

| Rota         | Acesso   | O que é |
|--------------|----------|---------|
| `/register`  | Público  | Ficha de cadastro (envie o link às pessoas) |
| `/login`     | Público  | Entrada do painel (senha) |
| `/dashboard` | Protegido | Painel: filtros, "não chamar", PDF, WhatsApp |

## Notas

- **Segurança do login:** por ora é um gate simples (a senha vive no bundle do front). Serve só
  para tirar o painel da vista. Autenticação de verdade virá com um backend real — ver o plano.
- **Fotos:** redimensionadas no navegador antes do upload; ficam no Drive e o link é salvo na
  planilha.
- **Datas** trafegam como ISO (`yyyy-mm-dd`) — simples e seguro para a planilha.
