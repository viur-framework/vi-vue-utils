<template>
  <component :is="state.loginComponent" v-if="state.loginComponent"></component>
</template>
<script setup>
import LoginScreen37 from "./OldLogin/TheLoginScreen.vue"
import LoginScreen from "./Loginscreen/TheLoginScreen.vue"
import { onBeforeMount, reactive } from "vue"
import { Request } from "../utils/request"

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
