<template>
  <v-text-field
      v-model="searchQuery"
      label="Buscar por Nome"
      class="mb-4"
      clearable
      @input="onSearch"
  ></v-text-field>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: ''
    }
  },
  computed: {
    searchQuery: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
        this.$emit('search', value);
      }
    }
  }
};
</script>
