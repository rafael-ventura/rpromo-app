<template>
  <v-app>
    <v-container>
      <h1>Gerador de Fichas Cadastrais</h1>
      <div v-if="!autenticado">
        <v-text-field
            v-model="senha"
            :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPassword ? 'text' : 'password'"
            label="Digite a senha"
            @click:append="showPassword = !showPassword"
        ></v-text-field>
        <v-btn @click="verificarSenha">Entrar</v-btn>
      </div>
      <div v-if="autenticado">
        <v-text-field
            v-model="search"
            label="Buscar por Nome"
            class="mb-4"
            clearable
        ></v-text-field>
        <v-row>
          <v-col
              v-for="user in filteredUsers"
              :key="user['Nome Completo']"
              cols="12"
              sm="6"
              md="4"
          >
            <v-card class="mb-4">
              <v-card-title>{{ user['Nome Completo'] }}</v-card-title>
              <v-card-text>
                <p><strong>Telefone:</strong> {{ user['Numero de Telefone'] }}</p>
                <p><strong>RG:</strong> {{ user['RG '] }}</p>
                <p><strong>Email:</strong> {{ user['E-mail'] }}</p>
                <v-img
                    v-if="user['Fotos']"
                    :src="getImageUrl(user['Fotos'])"
                    aspect-ratio="1.75"
                ></v-img>
              </v-card-text>
              <v-card-actions>
                <v-btn @click="gerarPDF(user)">Gerar PDF</v-btn>
                <v-btn @click="abrirModal(user)">Ver Detalhes</v-btn>
              </v-card-actions>
            </v-card>
          </v-col>
        </v-row>
      </div>
      <v-dialog v-model="modal" max-width="600px">
        <v-card>
          <v-card-title>{{ selectedUser['Nome Completo'] }}</v-card-title>
          <v-card-text>
            <v-list dense>
              <v-list-item v-for="(value, key) in selectedUser" :key="key">
                <v-list-item-content>
                  <v-list-item-title>{{ key }}</v-list-item-title>
                  <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
                </v-list-item-content>
              </v-list-item>
            </v-list>
          </v-card-text>
          <v-card-actions>
            <v-btn @click="modal = false">Fechar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';

export default {
  data() {
    return {
      senha: '',
      showPassword: false,
      senhaCorreta: process.env.VUE_APP_PASSWORD,
      autenticado: false,
      users: [],
      search: '',
      selectedUser: null,
      modal: false,
    };
  },
  computed: {
    filteredUsers() {
      return this.users.filter(user =>
          user['Nome Completo'].toLowerCase().includes(this.search.toLowerCase())
      );
    }
  },
  methods: {
    verificarSenha() {
      if (this.senha === this.senhaCorreta) {
        this.autenticado = true;
        this.carregarUsuarios();
      } else {
        alert('Senha incorreta');
      }
    },
    async carregarUsuarios() {
      const API_KEY = process.env.VUE_APP_API_KEY;
      const sheetId = process.env.VUE_APP_SHEET_ID;
      const sheetRange = 'A:Z'; // Ajuste o intervalo conforme necessário
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${API_KEY}`;

      console.log('URL da API:', url); // Adicionando log para verificar a URL

      try {
        const response = await axios.get(url);
        console.log('Resposta da API:', response); // Log da resposta completa

        const rows = response.data.values;
        console.log('Dados das linhas:', rows); // Log dos dados das linhas

        if (!rows || rows.length === 0) {
          console.error('Nenhum dado encontrado na planilha.');
          return;
        }

        const headers = rows[0];
        console.log('Cabeçalhos:', headers); // Log dos cabeçalhos

        this.users = rows.slice(1).map(row => {
          let user = {};
          headers.forEach((header, index) => {
            user[header] = row[index];
          });
          return user;
        });

        console.log('Usuários processados:', this.users); // Log dos usuários processados
      } catch (error) {
        console.error('Erro ao carregar usuários:', error); // Log de erro detalhado
      }
    },
    gerarPDF(user) {
      const doc = new jsPDF();
      doc.text(`Ficha Cadastral de ${user['Nome Completo']}`, 10, 10);

      Object.keys(user).forEach((key, index) => {
        doc.text(`${key}: ${user[key]}`, 10, 20 + index * 10);
      });

      doc.save(`${user['Nome Completo']}.pdf`);
    },
    abrirModal(user) {
      this.selectedUser = user;
      this.modal = true;
    },
    getImageUrl(link) {
      const regex = /\/d\/(.*?)\//;
      const match = link.match(regex);
      if (match && match[1]) {
        return `https://drive.google.com/uc?export=view&id=${match[1]}`;
      }
      return link;
    }
  }
};
</script>
