<template>
  <v-col cols="12" sm="6" md="4">
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
        <v-btn @click="$emit('generate-pdf', user)">Gerar PDF</v-btn>
        <v-btn @click="$emit('view-details', user)">Ver Detalhes</v-btn>
      </v-card-actions>
    </v-card>
  </v-col>
</template>

<script>
export default {
  props: {
    user: Object
  },
  methods: {
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
