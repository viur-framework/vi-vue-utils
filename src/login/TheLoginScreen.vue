<template>
  <component :is="state.loginComponent" v-if="state.loginComponent" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotData">
      <slot :name="name" v-bind="slotData"></slot>
    </template>
  </component>
</template>

<script setup>
import LoginScreen37 from "./OldLogin/TheLoginScreen.vue"
import LoginScreen from "./Loginscreen/TheLoginScreen.vue"
import { onBeforeMount, reactive } from "vue"
import { Request } from "../utils/request"

// needs to be set so slots can be passed through
defineOptions({
  inheritAttrs: false
})

const state = reactive({
  loginComponent: null,
})

onBeforeMount(() => {
  Request.get("/vi/user/login")
    .then(async (resp) => {
      try {
        const data = await resp.json()
        if (Array.isArray(data)) {
          state.loginComponent = LoginScreen37
        } else {
          state.loginComponent = LoginScreen
        }
      } catch (error) {
        state.loginComponent = LoginScreen37
      }
    })
    .catch((error) => {
      state.loginComponent = LoginScreen37
    })
})
</script>
