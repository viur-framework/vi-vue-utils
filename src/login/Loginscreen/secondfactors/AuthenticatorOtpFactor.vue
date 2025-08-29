<template>
  <sl-alert :open="state.showCustomError" variant="danger">
    <sl-icon slot="icon" name="x-lg"></sl-icon>
    {{ $t("login.otp_error") }}
  </sl-alert>
  <vi-form
    ref="ViFormRef"
    module="user"
    action="edit"
    :fetch-url="state.currentUrl"
    label="placeholder"
    :use-categories="false"
    :layout="UserPasswordLoginLayout"
  ></vi-form>
  <sl-button variant="primary" type="submit" @click="sendotp">
    {{ $t("login.otp") }}
  </sl-button>
</template>
<script setup>
import { computed, reactive, useTemplateRef, inject, watch } from "vue"
import { useUserStore } from "../../stores/user"
import ViForm from "../../../forms/ViForm.vue"
const ViFormRef = useTemplateRef("ViFormRef")
const userStore = useUserStore()
const loginState = inject("loginState")
const props = defineProps({
  url: {
    type: String,
    required: true,
  },
})

const state = reactive({
  currentUrl: computed(() => props.url),
  showCustomError: false,
})

function sendotp() {
  state.showCustomError = false
  ViFormRef.value
    .sendData(ViFormRef.value.state.actionparams["action_url"])
    .then(async (resp) => {
      const data = await resp.json()
      console.log(data)
      if (ViFormRef.value.state.actionname === "edit") {
        state.showCustomError = true
      } else if (ViFormRef.value.state.actionname === "login_success") {
        userStore.updateUser()
      }
    })
    .catch((error) => {
      state.showCustomError = true
      loginState.loading = false
    })
}

watch(
  () => ViFormRef?.value?.state?.loading,
  (newVal, oldVal) => {
    if (newVal) {
      loginState.loading = true
    } else {
      loginState.loading = false
    }
  }
)
</script>
<style scoped></style>
