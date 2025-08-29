<template>
  <sl-button class="more-login-btn" @click="buttonAction">
    <sl-icon slot="prefix" library="bootstrap" name="google" class="google-icon"></sl-icon>
    {{ loginState["availableProviders"][name]["name"] }}
  </sl-button>
</template>
<script setup>
import { inject } from "vue"
import { useUserStore } from "../../stores/user"
import Request from "../../../utils/request"
const userStore = useUserStore()
const loginState = inject("loginState")

const props = defineProps({
  name: {
    required: true,
    type: String,
  },
})

function buttonAction() {
  window.location.href = Request.buildUrl(loginState["availableProviders"][props.name]["target"])
}
</script>

<style scoped>
#google_oauth {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
