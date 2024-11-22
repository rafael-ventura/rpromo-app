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
      <div v-if="autenticado">
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
import jsPDF from "jspdf";
import sheetService from "./services/sheetService";
import SearchBar from "./components/SearchBar.vue";
import UserDetails from "./components/UserDetails";
import PasswordInput from "./components/PasswordInput.vue";
import ActionButton from "@/components/ActionButton.vue";

export default {
  components: {
    ActionButton,
    SearchBar,
    UserDetails: UserDetails,
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

    gerarPDF(user) {
      const doc = new jsPDF();
      doc.text(`Ficha Cadastral de ${user["Nome Completo"]}`, 10, 10);

      Object.keys(user).forEach((key, index) => {
        doc.text(`${key}: ${user[key]}`, 10, 20 + index * 10);
      });

      doc.save(`${user["Nome Completo"]}.pdf`);
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
};
</script>
