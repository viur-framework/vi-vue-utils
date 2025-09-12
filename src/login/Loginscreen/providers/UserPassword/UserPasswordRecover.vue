<template>
  <sl-alert :open="state.showCustomError" variant="danger">
    <sl-icon slot="icon" name="exclamation-circle-fill"></sl-icon>
    {{ $t("login.recovery_error") }}
  </sl-alert>

  <sl-alert v-if="state.tooltip" open variant="info">
    <sl-icon slot="icon" name="info-circle-fill"></sl-icon>
    {{ $t(state.tooltip) }}
  </sl-alert>
  <vi-form
    ref="ViFormRef"
    module="user"
    action="edit"
    :fetch-url="state.currentUrl"
    label="placeholder"
    :layout="UserPasswordRecoverLayout"
  ></vi-form>

  <sl-button
    v-if="['no', 'loading', 'error'].includes(userStore.state['user.loggedin'])"
    variant="primary"
    type="submit"
    @click="buttonAction"
  >
    {{ $t("login.recovery_start") }}
  </sl-button>
</template>
<script setup>
import { computed, inject, onMounted, reactive, useTemplateRef, watch } from "vue"
import { useUserStore } from "../../../stores/user"
import ViForm from "../../../../forms/ViForm.vue"
import UserPasswordRecoverLayout from "./UserPasswordRecoverLayout.vue"

const ViFormRef = useTemplateRef("ViFormRef")
const loginState = inject("loginState")
const userStore = useUserStore()

const state = reactive({
  currentUrl: "/vi/user/auth_userpassword/pwrecover",
  showCustomError: false,
  recoveryKey: null,
  tooltip: computed(() => {
    if (!ViFormRef?.value?.state?.structure) return null
    console.log(Object.entries(ViFormRef?.value?.state?.structure))
    let params = Object.entries(ViFormRef?.value?.state?.structure)[0][1]?.params?.tooltip
    if (!params) return null
    return params
  }),
})

function buttonAction() {
  state.showCustomError = false
  loginState.loading = true
  if (Object.keys(ViFormRef.value.state.skel).includes("recovery_key")) {
    state.recoveryKey = ViFormRef.value.state.skel["recovery_key"]
  }
  let params = {}
  if (state.recoveryKey) {
    params["recovery_key"] = state.recoveryKey
  }
  ViFormRef.value
    .sendData(state.currentUrl, params)
    .then(async (resp) => {
      loginState.loading = false
      let data = await resp.json()
      if (ViFormRef.value.state.actionname === "edit") {
        ViFormRef.value.state.skel = data["values"]
        ViFormRef.value.state.structure = data["structure"]
      } else {
        userStore.updateUser()
        loginState.currentaction = "select_authentication_provider"
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
