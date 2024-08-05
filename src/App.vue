<template>
  <div id="app">
    <h1>Gerador de Fichas Cadastrais</h1>
    <input type="password" v-model="senha" placeholder="Digite a senha" />
    <button @click="verificarSenha">Entrar</button>
    <div v-if="autenticado">
      <select v-model="selectedUser">
        <option v-for="user in users" :key="user.Nome_Completo" :value="user">
          {{ user.Nome_Completo }}
        </option>
      </select>
      <button @click="gerarPDF">Gerar PDF</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import jsPDF from 'jspdf';

export default {
  data() {
    return {
      senha: '',
      senhaCorreta: 'sua_senha_aqui', // Coloque a senha correta aqui
      autenticado: false,
      users: [],
      selectedUser: null
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
      const API_KEY = process.env.VUE_APP_API_KEY;
      const sheetId = process.env.VUE_APP_SHEET_ID;
      const sheetRange = 'A:Z'; // Ajuste o intervalo conforme necessário
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetRange}?key=${API_KEY}`;

      try {
        const response = await axios.get(url);
        const rows = response.data.values;
        const headers = rows[0];
        this.users = rows.slice(1).map(row => {
          let user = {};
          headers.forEach((header, index) => {
            user[header] = row[index];
          });
          return user;
        });
      } catch (error) {
        console.error('Erro ao carregar usuários:', error);
      }
    },
    gerarPDF() {
      if (!this.selectedUser) return;

      const user = this.selectedUser;
      const doc = new jsPDF();
      doc.text(`Ficha Cadastral de ${user.Nome_Completo}`, 10, 10);

      Object.keys(user).forEach((key, index) => {
        doc.text(`${key}: ${user[key]}`, 10, 20 + index * 10);
      });

      doc.save(`${user.Nome_Completo}.pdf`);
    }
  }
};
</script>
