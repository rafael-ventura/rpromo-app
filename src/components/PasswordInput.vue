<template>
  <v-text-field
      v-model="password"
      :append-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
      :type="showPassword ? 'text' : 'password'"
      label="Digite a senha"
      @click:append="togglePasswordVisibility"
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
  data() {
    return {
      showPassword: false
    };
  },
  computed: {
    password: {
      get() {
        return this.value;
      },
      set(value) {
        this.$emit('input', value);
      }
    }
  },
  methods: {
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword;
    }
  }
};
</script>
