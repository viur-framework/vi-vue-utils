<template>
  <div class="google-login">
    <sl-alert class="google-login-error" v-if="userStore.state['user.loggedin'] === 'error'" variant="danger" open>
      <sl-icon slot="icon" name="exclamation-circle-fill"></sl-icon>
      {{ $t("login.google_error") }}
    </sl-alert>
    <div id="google_oauth" class="google-login-oauth"></div>
    <sl-button class="google-login-btn" @click="googleLogin">
      <sl-icon slot="prefix" library="bootstrap" name="google" class="google-icon"></sl-icon>
      {{ $t("login.with_google") }}
    </sl-button>
  </div>
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
.google-login{
  display: flex;
  flex-direction: column;
  gap: var(--sl-spacing-medium)
}

.google-login-oauth {
  display: flex;
  justify-content: center;

  &:empty {
    display: none;
  }

}
</style>
