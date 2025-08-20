# RPromo - Sistema de Fichas Cadastrais

Sistema moderno e robusto para gerenciamento de fichas cadastrais, desenvolvido em Angular com Material Design. Substitui o antigo sistema baseado em Google Forms, oferecendo uma solução completa e profissional.

## 🚀 Características Principais

### ✨ Funcionalidades
- **Autenticação Simples**: Sistema de login com username/senha
- **Dashboard Interno**: Interface completa para funcionários gerenciarem cadastros
- **Formulário Público**: Formulário externo para cadastro de pessoas
- **Busca Avançada**: Sistema de busca por nome, CPF, email ou telefone
- **Geração de PDF**: PDFs profissionais das fichas cadastrais
- **Banco de Dados**: Integração com Supabase para persistência
- **Upload de Fotos**: Sistema de armazenamento de imagens
- **Responsivo**: Interface adaptável para desktop, tablet e mobile

### 🎨 Interface Moderna
- **Material Design**: Interface seguindo as diretrizes do Google
- **Tema Personalizado**: Cores e estilização profissional da RPromo
- **Animações Suaves**: Transições e feedbacks visuais
- **UX Otimizada**: Experiência do usuário intuitiva

## 🏗 Estrutura do Projeto

```
rpromo-angular/
├── frontend/                   # Frontend Angular
│   ├── src/                   # Código fonte Angular
│   │   ├── app/
│   │   │   ├── components/    # Componentes (login, etc)
│   │   │   ├── features/      # Funcionalidades (dashboard, cadastro)
│   │   │   ├── services/      # Serviços (auth, pessoa, pdf, etc)
│   │   │   ├── guards/        # Guards de rota
│   │   │   ├── models/        # Modelos de dados
│   │   │   └── shared/        # Componentes compartilhados
│   │   ├── assets/           # Recursos estáticos
│   │   └── environments/     # Configurações de ambiente
│   ├── public/               # Arquivos públicos
│   ├── angular.json          # Configuração Angular
│   ├── package.json          # Dependências frontend
│   └── tsconfig*.json        # Configuração TypeScript
├── backend/                   # Backend utilities e scripts
│   ├── database/             # Scripts SQL organizados
│   │   ├── 01-extensions.sql      # Extensões PostgreSQL
│   │   ├── 02-pessoas-table.sql   # Tabela de pessoas
│   │   ├── 03-usuarios-table.sql  # Tabela de usuários
│   │   ├── 04-triggers.sql        # Triggers e funções
│   │   ├── 05-rls-policies.sql    # Políticas de segurança
│   │   ├── 06-sample-data.sql     # Dados de exemplo
│   │   └── complete-setup.sql     # Script completo
│   ├── scripts/              # Scripts utilitários
│   │   ├── setup-project.js       # Instruções de configuração
│   │   └── setup-admin.js         # Criação de usuário admin
│   ├── utils/                # Utilitários backend
│   └── package.json          # Dependências backend
└── README.md                 # Este arquivo
```

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Angular CLI
- Conta no Supabase

### 🗄️ Setup do Banco de Dados

1. **Crie um projeto no [Supabase](https://supabase.com)**

2. **Execute os scripts SQL na ordem:**
   ```bash
   cd backend
   npm run setup  # Ver instruções detalhadas
   ```

3. **Execute no Supabase SQL Editor:**
   - `01-extensions.sql`
   - `02-pessoas-table.sql`
   - `03-usuarios-table.sql`
   - `04-triggers.sql`
   - `05-rls-policies.sql`
   - `06-sample-data.sql` (opcional - dados de teste)

   **OU execute o arquivo único:**
   - `complete-setup.sql`

### 🔐 Criar Usuário Administrador

```bash
cd backend
npm run create-admin username senha123
```

Copie e execute o SQL gerado no Supabase.

### ⚙️ Configurar Frontend

1. **Instalar dependências:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configurar ambiente:**
   ```typescript
   // frontend/src/environments/environment.ts
   export const environment = {
     production: false,
     supabase: {
       url: 'https://SEU_PROJETO.supabase.co',
       anonKey: 'SUA_SUPABASE_ANON_KEY'
     }
   };
   ```

3. **Executar o projeto:**
   ```bash
   cd frontend
   ng serve
   ```

4. **Acessar:**
   - Abra `http://localhost:4200`
   - Use as credenciais criadas no passo anterior

## 📋 Campos do Formulário

### Dados Pessoais
- Nome Completo, CPF, RG, Órgão Emissor
- Data de Expedição, Data de Nascimento
- Sexo, Raça/Cor, Naturalidade
- Nome do Pai, Nome da Mãe
- E-mail, Telefone

### Documentos
- Título de Eleitor (número, zona, seção)
- Carteira de Trabalho, Data de Emissão
- PIS, Certificado de Reservista

### Dados Bancários
- Tipo de Conta, Banco, Agência
- Número da Conta, Chave PIX

### Endereço
- Rua, Bairro, Cidade, CEP

### Informações Familiares
- Tem filhos?, Quantidade de filhos
- Nome e data de nascimento dos filhos

## 🛠 Tecnologias Utilizadas

### Frontend
- **Angular 18**: Framework principal
- **Angular Material**: Componentes UI modernos
- **TypeScript**: Linguagem de programação tipada
- **SCSS**: Estilização avançada
- **RxJS**: Programação reativa

### Backend
- **Supabase**: Plataforma backend-as-a-service
- **PostgreSQL**: Banco de dados robusto
- **Row Level Security (RLS)**: Segurança granular
- **bcryptjs**: Hash seguro de senhas

### Bibliotecas
- **jsPDF**: Geração de PDFs profissionais
- **html2canvas**: Captura de elementos HTML

## 🔒 Segurança

- **Autenticação customizada** com hash bcrypt
- **Row Level Security (RLS)** no Supabase
- **Políticas granulares** de acesso aos dados
- **Validações** no frontend e backend
- **HTTPS** para comunicação segura

## 📱 Funcionalidades

### Dashboard (Interno - Funcionários)
- Estatísticas e visão geral dos cadastros
- Lista completa com filtros avançados
- Busca em tempo real
- Geração de PDFs individuais e em lotes
- Edição e exclusão de cadastros
- Controle de status (Ativo/Inativo)

### Formulário de Cadastro (Externo - Público)
- Interface responsiva e intuitiva
- Validação em tempo real
- Upload de fotos e documentos
- Campos dinâmicos para filhos
- Máscaras automáticas (CPF, telefone, etc.)

## 🚀 Build para Produção

```bash
cd frontend
ng build --configuration production
```

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 🔧 Scripts Disponíveis

### Backend
```bash
cd backend
npm run setup          # Instruções de configuração
npm run create-admin    # Criar usuário administrador
```

### Frontend
```bash
cd frontend
npm start              # Executar em desenvolvimento
npm run build          # Build para produção
npm test               # Executar testes
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte técnico:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de cadastros da RPromo**
