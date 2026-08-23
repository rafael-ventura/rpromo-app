# RPromo — Backend Google Apps Script (Sheets + Drive)

Este é o backend do app: um único **Web App** do Google Apps Script que lê/escreve numa
planilha do Google Sheets e guarda as fotos numa pasta do Google Drive. **Sem servidor** e
**sem credencial no front** — o Angular só conhece a URL pública `/exec`.

## Passo a passo (uma vez)

### 1. Criar a planilha e a pasta de fotos
1. Crie uma **planilha** no Google Sheets. Na URL, copie o `SHEET_ID`
   (`https://docs.google.com/spreadsheets/d/`**`SHEET_ID`**`/edit`).
2. Crie uma **pasta** no Google Drive para as fotos. Na URL, copie o `DRIVE_FOLDER_ID`
   (`https://drive.google.com/drive/folders/`**`DRIVE_FOLDER_ID`**).

> Não precisa criar a aba `People` nem o cabeçalho: o script cria automaticamente na 1ª chamada.

### 2. Colar o script
1. Na planilha: menu **Extensões → Apps Script**.
2. Apague o conteúdo padrão e cole o conteúdo de [`Code.gs`](./Code.gs).
3. No topo, preencha o `CONFIG`:
   ```js
   const CONFIG = {
     SHEET_ID: 'cole_aqui',
     SHEET_NAME: 'People',
     DRIVE_FOLDER_ID: 'cole_aqui',
   };
   ```
4. Salve (💾).

### 3. Publicar como Web App
1. **Deploy → New deployment**.
2. Tipo: **Web app**.
3. **Execute as:** *Eu (seu e-mail)*.
4. **Who has access:** **Anyone** (qualquer pessoa) — necessário para o app público.
5. **Deploy** e autorize o acesso à planilha/Drive quando pedir.
6. Copie a **URL do Web app** (termina em `/exec`).

### 4. Conectar no Angular
Cole a URL `/exec` em `frontend/src/environments/environment.ts` (campo `webAppUrl`).

> **Sempre que editar o `Code.gs`**, faça **Deploy → Manage deployments → editar (lápis) →
> New version** para a mudança valer na mesma URL.

## API (referência)

Todas as respostas são JSON `{ ok: boolean, data?, error? }`.

| Método | Ação | Corpo / Query | Retorno |
|--------|------|---------------|---------|
| `GET`  | `list` | `?action=list` | `data: Person[]` |
| `POST` | `create` | `{ action, person }` | `data: Person` (com `id`, `createdAt`) |
| `POST` | `update` | `{ action, id, person }` | `data: Person` |
| `POST` | `setStatus` | `{ action, id, status }` | `data: Person` |
| `POST` | `setDoNotCall` | `{ action, id, value, reason? }` | `data: Person` |
| `POST` | `uploadPhoto` | `{ action, base64, filename, mimeType }` | `data: { fileId, url }` |

O POST usa `Content-Type: text/plain;charset=utf-8` de propósito (evita o *preflight* de CORS
que o Apps Script não trata bem); o corpo continua sendo JSON.

## Esquema da planilha (aba `People`)

A 1ª linha é o cabeçalho (criado automaticamente) e cada pessoa é uma linha. As colunas seguem,
na ordem, o array `HEADERS` do `Code.gs` — que espelha o modelo `Person` do front-end. A coluna
`children` guarda um JSON (lista de filhos). Trocar de backend no futuro (Firebase/SQL) não exige
mexer aqui: basta criar outra implementação de `PeopleRepository` no Angular.
