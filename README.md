# Gerador de Fichas Cadastrais

Este projeto visa automatizar o processo da Rpromo, que trabalha com eventos e marketing, com a criação de fichas cadastrais para os funcionários temporários contratados durante a alta demanda, como na época de Natal. Anteriormente, esse processo era feito manualmente, o que era extremamente trabalhoso e ineficiente.

## 📜 Sobre

A ideia surgiu após a limitação da plataforma Jotforms ser alcançada, causando interrupções no processo de contratação. A solução encontrada foi criar um formulário no Google Forms que salva as respostas em uma planilha no Google Drive e utilizar o GitHub Pages para hospedar um frontend desenvolvido em Vue.js, que lê essa planilha, exibe os dados de maneira resumida e detalhada, e permite a geração de um PDF com a ficha cadastral individual de cada funcionário.

## 🚧 Aviso

:warning: Esta aplicação é um protótipo e pode necessitar de ajustes conforme o aumento da demanda e uso contínuo.

## 🚀 Funcionalidades

- 📝 Autenticação por senha.
- 📄 Exibição de todos os cadastros em cards.
- 🕵️‍♀️ Busca por nome.
- 📋 Visualização detalhada das informações de cada cadastro.
- 🖨️ Geração de PDF com a ficha cadastral individual.

## 🔧 Tecnologias

Esta aplicação é construída com as seguintes tecnologias:

- ![Vue Badge](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white) Vue 3 para o desenvolvimento do frontend.
- ![Vuetify Badge](https://img.shields.io/badge/Vuetify-1867C0?style=for-the-badge&logo=vuetify&logoColor=white) Vuetify para os componentes de UI.
- ![Axios Badge](https://img.shields.io/badge/Axios-5A29E4?style=for-the-badge&logo=axios&logoColor=white) Axios para requisições HTTP.
- ![jsPDF Badge](https://img.shields.io/badge/jsPDF-FF0000?style=for-the-badge&logo=jsPDF&logoColor=white) jsPDF para geração de PDFs.

## Pré-requisitos

Antes de começar, você vai precisar ter instalado em sua máquina as seguintes ferramentas:

- **Node.js** com versão superior ou igual a 8.1 - [Node Download](https://nodejs.org/pt-br/download/)
- **NPM** com versão superior ou igual a 5.6 - [Npm Download](https://www.npmjs.com/package/download)

## Instalação

```bash
# Clone este projeto 
git clone [Url do seu repositório]

# Acesse a pasta do projeto em seu terminal
cd [Nome da pasta do seu Projeto]

# Instale as dependências:
yarn install

# Para rodar o projeto
yarn serve
```

### Próximos Passos:

- Implementar paginação para melhorar a navegação entre os registros.
- Melhorar o gerenciamento das imagens vinculadas aos cadastros.
- Melhorar a estética do PDF.

## Autores
-  Rafael Cantanhede Ventura Siqueira - Desenvolvedor e Idealizador do Projeto 
