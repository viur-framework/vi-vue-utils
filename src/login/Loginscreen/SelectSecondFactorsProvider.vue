<template>
  <template v-if="!state.selection">
    <template v-for="(provider, name, idx) in loginState.availableSecondfactors" :key="name">
      <sl-button @click="providerSelection(name)">{{ provider["name"] }}</sl-button>

      <div v-if="idx < Object.entries(loginState.availableSecondfactors).length - 1" class="or">
        {{ $t("login.or") }}
      </div>
    </template>
  </template>

  <component
    :is="providers[state.selection]"
    v-else
    :url="loginState.availableSecondfactors[state.selection]['target']"
  ></component>
</template>
<script setup>
import providers from "./secondfactors/index.js"
import { inject, reactive } from "vue"
const loginState = inject("loginState")

const state = reactive({
  selection: null,
})

function providerSelection(providername) {
  state.selection = providername
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
