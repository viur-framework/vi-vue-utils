<template>
  <sl-button class="more-login-btn" @click="buttonAction(loginState.availableProviders[name].target)">
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

async function buttonAction(ev) {
  try {
    const resp = await Request.securePost("/json/user/select_authentication_provider/" + ev)
    if(!resp.ok) {
      throw new Error("Fehler")
    }
    let data = await resp.json()
    loginState.currentaction = data.action
    loginState.formByPass = data.next_url
  } catch(err) {
    console.log(err)
  }
}
</script>

<style scoped>
#google_oauth {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}
</style>
