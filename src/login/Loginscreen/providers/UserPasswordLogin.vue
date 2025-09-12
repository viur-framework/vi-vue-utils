<template>
  <div class="login-forgot-password">
    <sl-alert :open="state.showCustomError" variant="danger">
      <sl-icon slot="icon" name="exclamation-circle-fill"></sl-icon>
      {{ $t("login.login_error") }}
    </sl-alert>
    <vi-form
      ref="ViFormRef"
      module="user"
      action="edit"
      :fetch-url="state.currentUrl"
      label="placeholder"
      :layout="UserPasswordLoginLayout"
    ></vi-form>

    <sl-button
      v-if="['no', 'loading', 'error'].includes(userStore.state['user.loggedin'])"
      variant="primary"
      type="submit"
      class="login-forgot-password-submit"
      @click="userLogin"
    >
      {{ $t("login.login") }}
    </sl-button>

    <sl-button v-else
      class="login-forgot-password-logout"
      @click="logout">{{ $t("login.logout") }}</sl-button>

    <sl-bar style="width: 100%">
      <span slot="right" class="login-forgot-password-link" @click="PasswortRecover">{{ $t("login.lost_password") }}</span>
    </sl-bar>
  </div>
</template>

<script setup>
import {
  reactive,
  inject,
  defineComponent,
  computed,
  ref,
  watchEffect,
  useTemplateRef,
  onMounted,
  onBeforeMount,
  watch,
} from "vue"
import { useFocus } from "@vueuse/core"
import { useUserStore } from "../../stores/user"
import ViForm from "../../../forms/ViForm.vue"
import UserPasswordLoginLayout from "./UserPassword/UserPasswordLoginLayout.vue"

const ViFormRef = useTemplateRef("ViFormRef")
const userStore = useUserStore()
const loginState = inject("loginState")

const props = defineProps({
  name: {
    required: true,
    type: String,
  },
})

const state = reactive({
  currentUrl: "/vi/user/auth_userpassword/login",
  showCustomError: false,
})

onBeforeMount(() => {
  userStore.updateUser()
})

function userLogin() {
  state.showCustomError = false
  loginState.loading = true
  ViFormRef.value
    .sendData(state.currentUrl)
    .then(async (resp) => {
      loginState.loading = false
      let data = await resp.json()
      console.log(data)
      if (ViFormRef.value.state.actionname === "login" && ViFormRef.value.state.errors.length > 0) {
        state.showCustomError = true
        loginState.availableSecondfactors = {}
      } else if (ViFormRef.value.state.actionname === "select_secondfactor_provider") {
        let providers = {}
        for (const [k, v] of Object.entries(data["structure"]["provider"]["values"])) {
          const match = k.match(/f2_(.+?)\/start/)
          const extracted = match ? match[1] : null
          providers[extracted] = { target: k, name: v }
        }
        loginState.availableSecondfactors = providers
        loginState.currentaction = ViFormRef.value.state.actionname
      } else if (ViFormRef.value.state.actionname === "login_success") {
        userStore.updateUser()
      } else if (ViFormRef.value.state.actionparams) {
        state.currentUrl = ViFormRef.value.state.actionparams["action_url"]
        ViFormRef.value.state.skel = data["values"]
        ViFormRef.value.state.structure = data["structure"]
        //ViFormRef.value.fetchData(state.currentUrl)
      }
    })
    .catch((error) => {
      state.showCustomError = true
      loginState.loading = false
    })
}

function PasswortRecover() {
  loginState.currentaction = "pwrecover"
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

<style scoped>

.login-forgot-password{
  display: flex;
  flex-direction: column;
  gap: var(--sl-spacing-medium);
}

sl-button {
  width: 100%;

  &[disabled] {
    &::part(base) {
      opacity: 1;
    }
  }
}

.login-forgot-password-link {
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--sl-color-neutral-500);
  padding: 0 var(--sl-spacing-x-small);

  &:hover {
    color: var(--sl-color-neutral-700);
  }
}
</style>
