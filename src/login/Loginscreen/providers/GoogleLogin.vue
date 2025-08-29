<template>
  <sl-alert v-if="userStore.state['user.loggedin'] === 'error'" variant="danger" open>
    <sl-icon slot="icon" name="x-lg"></sl-icon>
    {{ $t("login.google_error") }}
  </sl-alert>
  <div id="google_oauth"></div>
  <sl-button class="more-login-btn" @click="googleLogin">
    <sl-icon slot="prefix" library="bootstrap" name="google" class="google-icon"></sl-icon>
    {{ $t("login.with_google") }}
  </sl-button>
</template>
<script setup>
import { useUserStore } from "../../stores/user"
const userStore = useUserStore()
const props = defineProps({
  name: {
    required: true,
    type: String,
  },
})
function googleLogin() {
  userStore.googleLogin()
}
</script>

<style scoped>
#google_oauth {
  display: flex;
  justify-content: center;
}
#google_oauth:empty {
  margin-bottom: 0;
}

#google_oauth:not(:empty) {
  margin-bottom: 20px;
}
</style>
