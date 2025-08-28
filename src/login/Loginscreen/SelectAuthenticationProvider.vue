<template>
  <template v-for="(provider, name, idx) in loginState.availableProviders" :key="name">
    <component :is="getWidget(name)" :name="name"></component>
    <div v-if="idx < Object.entries(loginState.availableProviders).length - 1" class="or">
      {{ $t("login.or") }}
    </div>
  </template>
</template>
<script setup>
import providers from "./providers/index.js"
import { inject } from "vue"
const loginState = inject("loginState")

function getWidget(name) {
  if (Object.keys(providers).includes(name)) {
    return providers[name]
  }
  return providers.defaultlogin
}
</script>
<style scoped>
.or {
  opacity: 0.5;
  padding: var(--sl-spacing-small) 0;
  margin: 0 auto;
  text-align: center;
  font-size: 0.9em;
}
</style>
