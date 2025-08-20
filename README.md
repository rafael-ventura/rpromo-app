# RPromo - Sistema de Fichas Cadastrais

Um sistema moderno e robusto para gerenciamento de fichas cadastrais, desenvolvido em Angular com Material Design. Substitui o antigo sistema baseado em Google Forms, oferecendo uma solução completa e profissional.

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
- **Tema Personalizado**: Cores e estilização profissional
- **Animações Suaves**: Transições e feedbacks visuais
- **UX Otimizada**: Experiência do usuário intuitiva

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

### Documentos Digitais
- Upload de fotos
- Comprovante de vacinação COVID

## 🛠 Tecnologias Utilizadas

### Frontend
- **Angular 18**: Framework principal
- **Angular Material**: Componentes UI
- **TypeScript**: Linguagem de programação
- **SCSS**: Estilização avançada
- **RxJS**: Programação reativa

### Bibliotecas
- **jsPDF**: Geração de PDFs
- **html2canvas**: Captura de elementos HTML
- **IndexedDB**: Armazenamento local de imagens

### Arquitetura
- **Standalone Components**: Arquitetura moderna do Angular
- **Reactive Forms**: Formulários reativos com validação
- **Services**: Camada de serviços para lógica de negócio
- **Observables**: Gerenciamento de estado reativo

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js (versão 18 ou superior)
- npm ou yarn
- Angular CLI

### Passos de Instalação

1. **Clone o repositório**
   ```bash
   git clone <url-do-repositorio>
   cd rpromo-angular
   ```

2. **Instale as dependências**
   ```bash
   npm install
   cd backend
   npm install
   cd ..
   ```

3. **Configure o banco de dados**
   - Execute os scripts SQL em `backend/database/bd-01.sql` no seu Supabase
   - Configure as variáveis de ambiente em `src/environments/`

4. **Execute o servidor de desenvolvimento**
   ```bash
   ng serve
   ```

5. **Acesse a aplicação**
   - Abra o navegador em `http://localhost:4200`
   - Use as credenciais padrão:
     - **Usuário:** `admin` / **Senha:** `admin123`
     - **Usuário:** `teste` / **Senha:** `teste123`

### Build para Produção
```bash
ng build --prod
```

## 🏗 Estrutura do Projeto

```
rpromo-angular/
├── backend/                     # Backend utilities e scripts
│   ├── database/               # Scripts de banco de dados
│   │   ├── bd-01.sql          # Estrutura principal com autenticação
│   │   └── supabase_schema.sql # Schema do Supabase
│   ├── scripts/               # Scripts utilitários
│   │   └── create-users.js    # Criação de usuários
│   ├── types/                 # Definições TypeScript
│   │   ├── usuario.types.ts   # Tipos de usuários
│   │   └── pessoa.types.ts    # Tipos de pessoas
│   ├── utils/                 # Utilitários backend
│   │   └── user-creator.ts    # Criador de usuários
│   ├── docs/                  # Documentação
│   └── package.json           # Dependências backend
├── src/                       # Frontend Angular
│   ├── app/
│   │   ├── components/
│   │   │   └── login/         # Componente de login
│   │   ├── features/
│   │   │   ├── dashboard/     # Dashboard interno
│   │   │   └── cadastro/      # Formulário de cadastro
│   │   ├── services/
│   │   │   ├── auth.service.ts    # Autenticação
│   │   │   ├── pessoa.service.ts  # Gerenciamento de pessoas
│   │   │   ├── foto.service.ts    # Upload de fotos
│   │   │   └── pdf.service.ts     # Geração de PDFs
│   │   ├── guards/            # Guards de rota
│   │   ├── models/            # Modelos de dados
│   │   └── shared/            # Componentes compartilhados
│   └── styles.scss            # Estilos globais
└── package.json               # Dependências frontend
```

## 📱 Funcionalidades Detalhadas

### Dashboard (Interno - Funcionários)
- **Estatísticas**: Visão geral dos cadastros
- **Lista de Pessoas**: Visualização completa com filtros
- **Busca em Tempo Real**: Sistema de busca com debounce
- **Ações por Pessoa**:
  - Visualizar detalhes
  - Editar cadastro
  - Gerar PDF individual
  - Alterar status (Ativo/Inativo/Pendente)
  - Excluir cadastro
- **Relatórios**: Geração de PDFs com múltiplas pessoas
- **Exportação**: Backup dos dados em JSON

### Formulário de Cadastro (Externo - Público)
- **Formulário Expansível**: Seções organizadas em abas
- **Validação em Tempo Real**: Feedback imediato de erros
- **Upload de Arquivos**: Drag & drop para fotos e documentos
- **Campos Dinâmicos**: Adição/remoção de filhos conforme necessário
- **Máscaras de Input**: Formatação automática de CPF, telefone, etc.
- **Responsivo**: Funciona perfeitamente em dispositivos móveis

### Sistema de Armazenamento
- **localStorage**: Dados das pessoas e metadados
- **IndexedDB**: Armazenamento otimizado de imagens
- **Compressão**: Redimensionamento automático de fotos
- **Backup/Restore**: Sistema de exportação e importação

## 🔒 Segurança e Privacidade

- **Armazenamento Local**: Dados ficam no navegador do usuário
- **Sem Servidor**: Não requer backend ou banco de dados
- **Validação Cliente**: Validação robusta no frontend
- **Sanitização**: Limpeza de dados de entrada

## 🎯 Casos de Uso

### Para Empresas
- Cadastro de funcionários
- Processo de admissão
- Controle de documentação
- Relatórios para RH

### Para Organizações
- Cadastro de membros
- Eventos e inscrições
- Controle de participantes
- Documentação oficial

### Para Consultórios
- Ficha de pacientes
- Documentação médica
- Controle de consultas
- Relatórios administrativos

## 🚀 Melhorias Futuras

- [ ] Integração com APIs externas (CEP, bancos)
- [ ] Sistema de backup na nuvem
- [ ] Notificações push
- [ ] Relatórios avançados com gráficos
- [ ] Sistema de templates de PDF personalizáveis
- [ ] Integração com sistemas de e-mail
- [ ] Módulo de agendamentos
- [ ] Sistema de permissões de usuário

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Suporte

Para dúvidas ou suporte técnico:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido com ❤️ para facilitar o gerenciamento de cadastros**
