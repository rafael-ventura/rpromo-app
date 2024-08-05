<template>
  <v-dialog :value="visible" max-width="600px" @input="updateVisibility">
    <v-card>
      <v-card-title>{{ user['Nome Completo'] }}</v-card-title>
      <v-card-text>
        <v-list dense>
          <v-list-item v-for="(value, key) in user" :key="key">
            <v-list-item-content>
              <v-list-item-title>{{ key }}</v-list-item-title>
              <v-list-item-subtitle>{{ value }}</v-list-item-subtitle>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-card-actions>
        <v-btn @click="close">Fechar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script>
export default {
  props: {
    user: Object,
    visible: Boolean
  },
  methods: {
    close() {
      this.$emit('close');
    },
    updateVisibility(value) {
      this.$emit('update:visible', value);
    }
  }
};
</script>
