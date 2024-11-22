<template>
  <v-dialog v-model="dialogVisible" max-width="1400px" :max-height="modalHeight">
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
                md="3"
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
        <!-- Botão Ver Fotos -->
        <ActionButton
            label="Ver Fotos"
            color="green"
            v-if="isToAppear"
            icon="mdi-image"
            @click="openGallery"
        />
        <ActionButton
            class="action-btn"
            label="Fechar"
            color="blue"
            icon="mdi-close"
            @click="closeDialog"
        />
      </v-card-actions>
    </v-card>

    <!-- Galeria de Fotos -->
    <v-dialog v-if="isToAppear" v-model="galleryVisible" max-width="800px">
      <v-card>
        <v-card-title class="justify-space-between">
          <h2 class="text-h5">Galeria de Fotos</h2>
          <v-btn icon="true" @click="galleryVisible = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        <v-divider></v-divider>
        <v-card-text>
          <v-carousel hide-delimiters>
            <v-carousel-item
                v-for="(photo, index) in photos"
                :key="index"
            >
              <v-img :src="photo.url">
                <v-row class="fill-height" align="end" justify="center">
                  <v-col class="text-center white--text" cols="12">
                    <span class="caption">{{ photo.caption }}</span>
                  </v-col>
                </v-row>
              </v-img>
            </v-carousel-item>
          </v-carousel>
        </v-card-text>
      </v-card>
    </v-dialog>
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
  data() {
    return {
      galleryVisible: false,
      photos: [],
      isToAppear: false,
    };
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
    modalHeight() {
      return '80vh'; // Define a altura do modal como 80% da altura da viewport
    },
  },
  methods: {
    closeDialog() {
      this.$emit("update:visible", false);
    },
    openGallery() {
      // IDs dos arquivos do Google Drive
      const fotoVacinaId = this.getDriveFileId(this.user['Vacina Covid']);
      const fotoUsuarioId = this.getDriveFileId(this.user['Fotos']);

      // Definindo as fotos a serem exibidas
      this.photos = [
        {
          url: fotoVacinaId ? `https://drive.google.com/uc?export=view&id=${fotoVacinaId}` : '',
          caption: 'Foto da Vacina COVID',
        },
        {
          url: fotoUsuarioId ? `https://drive.google.com/uc?export=view&id=${fotoUsuarioId}` : '',
          caption: 'Foto do Usuário',
        },
      ].filter(photo => photo.url);

      console.log(this.photos);
      this.galleryVisible = true;
    },
    getDriveFileId(url) {
      if (!url) return null;
      // Regex para extrair o ID do arquivo do Google Drive
      const regexPatterns = [
        /\/d\/([a-zA-Z0-9_-]+)/,           // Para links como /d/FILE_ID/
        /id=([a-zA-Z0-9_-]+)/,             // Para links com id=FILE_ID
        /\/file\/d\/([a-zA-Z0-9_-]+)/,     // Para links como /file/d/FILE_ID/
        /\/open\?id=([a-zA-Z0-9_-]+)/,     // Para links como /open?id=FILE_ID
      ];
      for (const regex of regexPatterns) {
        const match = url.match(regex);
        if (match && match[1]) {
          return match[1];
        }
      }
      return null;
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
  margin-top: -5%;
}
</style>
