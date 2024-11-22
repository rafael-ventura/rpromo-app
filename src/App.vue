<template>
  <v-app>
    <v-container>
      <v-row align="center">
        <v-col cols="auto">
          <v-img src="./assets/logo.jpeg" alt="Logo" height="100" width="100"></v-img>
        </v-col>
        <v-col>
          <h1>Gerador de Fichas Cadastrais</h1>
        </v-col>
      </v-row>
      <br>
      <div v-if="!autenticado">
        <PasswordInput v-model="senha"/>
        <v-btn @click="verificarSenha">Entrar</v-btn>
      </div>
      <div v-else>
        <SearchBar v-model="search" @search="filterUsers"/>
        <v-data-table
            :headers="headers"
            :items="filteredUsers"
            :items-per-page="itemsPerPage"
            v-model:page="page"
            class="elevation-1"
        >
          <template v-slot:body="{ items }">
            <tr v-for="user in items" :key="user['Nome Completo']">
              <td>{{ user['Nome Completo'] }}</td>
              <td>{{ user['Numero de Telefone'] }}</td>
              <td>{{ user['E-mail'] }}</td>
              <td>
                <ActionButton
                    label="Gerar PDF"
                    icon="mdi-file-pdf-box"
                    color="red"
                    @click="gerarPDF(user)"
                />
                <ActionButton
                    label="Ver Detalhes"
                    icon="mdi-eye"
                    color="blue"
                    @click="abrirModal(user)"
                />
              </td>
            </tr>
          </template>
        </v-data-table>
        <v-row v-if="loading" justify="center">
          <v-progress-circular indeterminate></v-progress-circular>
        </v-row>
      </div>
      <UserDetails
          :user="selectedUser"
          v-model:visible="modal"
      />
    </v-container>
  </v-app>
</template>

<script>
import sheetService from "./services/sheetService";
import SearchBar from "./components/SearchBar.vue";
import UserDetails from "./components/UserDetails";
import PasswordInput from "./components/PasswordInput.vue";
import ActionButton from "@/components/ActionButton.vue";
import pdfService from "@/services/pdfService";

export default {
  components: {
    ActionButton,
    SearchBar,
    UserDetails,
    PasswordInput,
  },
  data() {
    return {
      senha: "",
      senhaCorreta: process.env.VUE_APP_PASSWORD,
      autenticado: false,
      users: [],
      filteredUsers: [],
      search: "",
      selectedUser: null,
      modal: false,
      loading: false,
      itemsPerPage: 5,
      page: 1,
      headers: [
        {text: "Nome Completo", value: "Nome Completo"},
        {text: "Telefone", value: "Numero de Telefone"},
        {text: "E-mail", value: "E-mail"},
        {text: "Ações", value: "actions", sortable: false},
      ],
    };
  },
  methods: {
    async verificarSenha() {
      if (this.senha === this.senhaCorreta) {
        this.autenticado = true;

        // Define o tempo de expiração (exemplo: 3 horas a partir de agora)
        const expirationTime = new Date().getTime() + (3 * 60 * 60 * 1000); // 3 horas em milissegundos

        // Armazena no localStorage
        localStorage.setItem('autenticado', 'true');
        localStorage.setItem('autenticadoExpiracao', expirationTime);

        await this.carregarUsuarios();
      } else {
        alert("Senha incorreta");
      }
    },
    async carregarUsuarios() {
      this.loading = true;
      try {
        const users = await sheetService.carregarUsuarios();
        this.users = this.removerDuplicados(users);
        this.filteredUsers = this.users;
      } finally {
        this.loading = false;
      }
    },
    removerDuplicados(users) {
      const map = new Map();
      users.forEach(user => {
        const key = user['CPF'] || user['RG'];
        if (key) map.set(key, user);
      });
      return Array.from(map.values());
    },
    async gerarPDF(user) {
      try {
        await pdfService.gerarPDF(user);
      } catch (error) {
        console.error("Erro ao gerar o PDF:", error);
      }
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
      this.filteredUsers = this.users.filter((user) =>
          user["Nome Completo"]
              ?.toLowerCase()
              .includes(query.toLowerCase())
      );
    },
  },
  created() {
    const autenticado = localStorage.getItem('autenticado');
    const expiracao = localStorage.getItem('autenticadoExpiracao');

    // Verifica se a autenticação existe e não expirou
    if (autenticado === 'true' && expiracao && new Date().getTime() < parseInt(expiracao)) {
      this.autenticado = true;
      this.carregarUsuarios();
    } else {
      // Se a autenticação expirou, limpa o localStorage
      localStorage.removeItem('autenticado');
      localStorage.removeItem('autenticadoExpiracao');
    }
  },
};
</script>
