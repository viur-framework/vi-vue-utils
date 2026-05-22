<script setup>
defineProps({
  wrap: Boolean,
  open: Boolean,
})
</script>

<template>
  <sl-details v-if="wrap" :open="open">
    <slot />
  </sl-details>
  <slot v-else />
</template>
