<template>
  <v-app>
    <v-container>
      <h1>Gerador de Fichas Cadastrais</h1>
      <div v-if="!autenticado">
        <PasswordInput v-model="senha"/>
        <v-btn @click="verificarSenha">Entrar</v-btn>
      </div>
      <div v-if="autenticado">
        <SearchBar v-model="search" @search="filterUsers"/>
        <v-row v-if="!loading">
          <UserCard
              v-for="user in filteredUsers"
              :key="user['Nome Completo']"
              :user="user"
              @generate-pdf="gerarPDF"
              @view-details="abrirModal"
          />
        </v-row>
        <v-row v-else justify="center">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-row>
      </div>
      <UserDetailsDialog
          :user="selectedUser"
          v-model:visible="modal"
          @close="modal = false"
      />
    </v-container>
  </v-app>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';
import SearchBar from './components/SearchBar.vue';
import UserCard from './components/UserCard.vue';
import UserDetailsDialog from './components/UserDetails';
import PasswordInput from './components/PasswordInput.vue';

export default {
  components: {
    SearchBar,
    UserCard,
    UserDetailsDialog,
    PasswordInput
  },
  data() {
    return {
      senha: '',
      senhaCorreta: process.env.VUE_APP_PASSWORD,
      autenticado: false,
      users: [],
      filteredUsers: [],
      search: '',
      selectedUser: null,
      modal: false,
      loading: false,
    };
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
      this.loading = true;
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
          this.loading = false;
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

        this.filteredUsers = this.users;

        console.log('Usuários processados:', this.users); // Log dos usuários processados
      } catch (error) {
        console.error('Erro ao carregar usuários:', error); // Log de erro detalhado
      } finally {
        this.loading = false;
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
    filterUsers(query) {
      if (!query) {
        this.filteredUsers = this.users;
        return;
      }
      this.filteredUsers = this.users.filter(user => {
        const nomeCompleto = user['Nome Completo'];
        return nomeCompleto && nomeCompleto.toLowerCase().includes(query.toLowerCase());
      });
    }
  }
};
</script>

<style>
.v-progress-circular {
  margin-top: 20px;
}
</style>
