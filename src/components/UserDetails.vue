<template>
  <v-dialog v-model="dialogVisible" max-width="1400px">
    <v-card>
      <!-- Cabeçalho -->
      <v-card-title class="justify-space-between">
        <h2 class="text-h5">{{ user?.['Nome Completo'] || 'Detalhes do Usuário' }}</h2>
      </v-card-title>

      <v-divider></v-divider>

      <!-- Conteúdo -->
      <v-card-text class="card-text">
        <v-container>
          <v-row dense>
            <v-col
                v-for="(value, key) in user"
                :key="key"
                cols="12"
                md="6"
            >
              <strong>{{ key }}:</strong>
              <p>{{ value || "Não informado" }}</p>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <!-- Ações -->
      <v-card-actions>
        <v-spacer></v-spacer>
        <ActionButton
            label="Fechar"
            color="blue"
            icon="mdi-close"
            @click="closeDialog"
        />
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
import ActionButton from "@/components/ActionButton.vue";

export default {
  components: {
    ActionButton,
  },
  props: {
    user: {
      type: Object,
      required: false,
      default: null,
    },
    visible: {
      type: Boolean,
      required: true,
    },
  },
  computed: {
    dialogVisible: {
      get() {
        return this.visible; // Retorna o valor da prop visível do pai
      },
      set(value) {
        this.$emit("update:visible", value); // Atualiza o estado no componente pai
      },
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:visible", false);
    },
  },
};
</script>

<style scoped>
/* Estilo para destacar o título */
.v-card-title h2 {
  font-weight: bold;
  margin: 0;
  padding-bottom: 0;
}

/* Removendo padding desnecessário da seção de texto */
.card-text {
  padding-bottom: 0;
}

/* Reduzindo o espaço entre o texto e o botão */
.v-card-actions {
  margin-top: 0;
  padding-top: 8px;
  padding-bottom: 8px;
}

/* Estilo para os textos */
p {
  font-size: 1rem;
}

/* Ajuste de estilo para ActionButton */
.action-btn {
  font-size: 1rem;
  color: white !important; /* Força o texto branco */
}
</style>

