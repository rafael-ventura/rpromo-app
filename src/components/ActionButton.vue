<template>
  <v-btn
      :color="color"
      :class="{ 'text-uppercase': uppercase }"
      @click="$emit('click')"
  >
    <v-icon v-if="icon" left class="icon">{{ icon }}</v-icon>
    {{ label }}
  </v-btn>
</template>

<script>
export default {
  props: {
    label: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: "primary",
    },
    uppercase: {
      type: Boolean,
      default: true,
    },
  },
};
</script>

<style scoped>

button {
  margin: 1%;
}

.icon {
  margin-right: 2px;
}

</style>
