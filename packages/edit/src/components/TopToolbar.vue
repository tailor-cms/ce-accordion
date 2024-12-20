<template>
  <div class="d-flex align-center justify-center">
    <VBtn
      color="primary-darken-4"
      prepend-icon="mdi-plus"
      variant="text"
      @click="elementBus.emit('add')"
    >
      Add accordion item
    </VBtn>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const elementBus: any = inject('$elementBus');
</script>

<style scoped></style>
