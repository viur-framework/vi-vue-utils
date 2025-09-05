<template>
  <sl-alert :open="state.showCustomError" variant="danger" style="margin-bottom: 20px">
    <sl-icon slot="icon" name="x-lg"></sl-icon>
    {{ $t("login.error") }}
  </sl-alert>

  <sl-alert v-if="state.tooltip" open variant="info">
    <sl-icon slot="icon" name="info"></sl-icon>
    {{ $t(state.tooltip) }}
  </sl-alert>
  <vi-form
    v-if="state.currentUrl"
    ref="ViFormRef"
    module="user"
    action="edit"
    :fetch-url="state.currentUrl"
    label="placeholder"
    :layout="DefaultLayout"
  ></vi-form>

  <sl-button
    v-if="['no', 'loading', 'error'].includes(userStore.state['user.loggedin'])"
    style="margin-top: 20px"
    variant="primary"
    type="submit"
    @click="buttonAction"
  >
    {{ $t("login.login") }}
  </sl-button>
</template>
<script setup>
// THIS IST BULLSHIT, CRAP BY DESIGN...
import { computed, inject, onMounted, reactive, useTemplateRef, watch } from "vue"
import { useUserStore } from "../../stores/user"
import ViForm from "../../../forms/ViForm.vue"
import DefaultLayout from "./Defaults/DefaultLayout.vue"
import Request from "../../../utils/request"

const ViFormRef = useTemplateRef("ViFormRef")
const loginState = inject("loginState")
const userStore = useUserStore()

const state = reactive({
  currentUrl: null,
  showCustomError: false,
  tooltip: computed(() => {
    if (!ViFormRef?.value?.state?.structure) return null
    let params = Object.entries(ViFormRef?.value?.state?.structure)[0]?.[1]?.params?.tooltip
    if (!params) return null
    return params
  }),
})
onMounted(() => {
  state.currentUrl = loginState.formByPass
})

function calcCurrentUrlOnAction(url, actionName) {
  let lastSlashIndex = url.lastIndexOf("/")
  lastSlashIndex = lastSlashIndex > url.indexOf("://") + 2 ? url.slice(0, lastSlashIndex) : url
  lastSlashIndex += "/" + actionName
  return lastSlashIndex
}

function buttonAction() {
  state.showCustomError = false
  loginState.loading = true
  ViFormRef.value
    .sendData(state.currentUrl)
    .then(async (resp) => {
      loginState.loading = false
      let data = await resp.json()
      if (!ViFormRef.value.state.actionname.endsWith("_success")) {
        ViFormRef.value.state.skel = data["values"]
        ViFormRef.value.state.structure = data["structure"]
        state.currentUrl = calcCurrentUrlOnAction(state.currentUrl, data["action"])
      } else if (ViFormRef.value.state.actionname.endsWith("_success") && data["next_url"]) {
        if (data["next_url"].startsWith("https://")) {
          window.location.href = Request.buildUrl(data["next_url"])
        } else {
          state.currentUrl = data["next_url"]
          buttonAction()
        }
      } else if (ViFormRef.value.state.actionname === "select_secondfactor_provider") {
        let providers = {}
        for (const [k, v] of Object.entries(data["structure"]["provider"]["values"])) {
          const match = k.match(/f2_(.+?)\/start/)
          const extracted = match ? match[1] : null
          providers[extracted] = { target: k, name: v }
        }
        loginState.availableSecondfactors = providers
        loginState.currentaction = ViFormRef.value.state.actionname
      } else {
        userStore.updateUser()
      }
    })
    .catch((error) => {
      console.log(error)
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
