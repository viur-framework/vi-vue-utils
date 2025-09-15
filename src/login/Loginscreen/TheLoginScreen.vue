<template>
  <div class="wrapper">
    <div class="background-img">
      <img :src="backgroundImage" />
    </div>
    <Loader v-if="state.waitFor === 'init' || (isRedirect && isUserLoggedIn)" class="loader" :logo="logo" :size="'7'" />

    <div v-else class="card">
      <img class="logo" :src="logo" />
      <span
        v-if="
          !['select_authentication_provider', 'select_authentication_provider_success'].includes(state.currentaction)
        "
        class="back"
        @click="state.currentaction = 'select_authentication_provider'"
      >
        {{ $t("viur.core.login.back") }}
      </span>
      <sl-alert v-if="isUserLoading || state.loading" variant="info" open>
        <sl-spinner slot="icon"></sl-spinner>
        {{ $t("viur.core.login.waiting") }}
      </sl-alert>

      <!-- select provider component -->
      <SelectAuthenticationProvider
        v-if="['select_authentication_provider'].includes(state.currentaction)"
      ></SelectAuthenticationProvider>

      <!-- user login or other login methods -->
      <FormLogin
        v-if="
          ['select_authentication_provider_success', 'pwrecover_success'].includes(state.currentaction) &&
          state.formByPass
        "
      ></FormLogin>

      <!-- second factor -->
      <SelectSecondFactorsProvider
        v-if="['select_secondfactor_provider', 'select_secondfactor_provider_success'].includes(state.currentaction)"
      ></SelectSecondFactorsProvider>

      <!-- bad hack for pw recovery process to reactively rerender the formlogin -->
      <FormLogin v-if="['pwrecover'].includes(state.currentaction) && state.formByPass"></FormLogin>

      <slot name="additional-actions"></slot>

      <div v-if="false && isUserLoading" class="overlay">
        <sl-spinner></sl-spinner>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onBeforeMount, defineComponent, watch, provide } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "../stores/user.js"
import Loader from "../../generic/Loader.vue"
import { getBoneWidget } from "../../bones/edit/index"
import { Request } from "../../utils/request"
import SelectAuthenticationProvider from "./SelectAuthenticationProvider.vue"
import SelectSecondFactorsProvider from "./SelectSecondFactorsProvider.vue"
import FormLogin from "./providers/FormLogin.vue"
import UserPasswordRecover from "./providers/UserPassword/UserPasswordRecover.vue"

const props = defineProps({
  username: { type: String, default: "" },
  isAppAuth: Boolean,
  isRedirect: { type: Boolean, default: false },
  backgroundImage: { type: String, default: "" },
  logo: { type: String, default: "" },
  title: { type: String, default: "Login" },
  tokenSvg: { type: String, default: "" },
  isLoggedIn: { type: Boolean, required: false },
  isLoading: { type: Boolean, required: false },
})

const userStore = useUserStore()
const router = useRouter()

const state = reactive({
  currentaction: "select_authentication_provider",
  defaultProvider: null,
  availableProviders: {},
  availableSecondfactors: {},
  loading: false,
  formByPass: false, //master of craps
})
provide("loginState", state)

// Computed properties for dynamic state checking
const isUserLoggedIn = computed(() => {
  // If isLoggedIn prop is defined, use it
  if (props.isLoggedIn !== undefined) {
    return props.isLoggedIn
  }
  // Otherwise fallback to userStore
  return userStore.state["user.loggedin"] === "yes"
})

const isUserLoading = computed(() => {
  // If isLoading prop is defined, use it
  if (props.isLoading !== undefined) {
    return props.isLoading
  }
  // Otherwise fallback to userStore
  return userStore.state["user.loggedin"] === "loading"
})

function setCurrentAction(actionUrl) {
  Request.get(actionUrl).then(async (resp) => {
    let data = await resp.json()
    state.currentaction = data["action"]
    state.formByPass = actionUrl
  })
}

onBeforeMount(async () => {
  try {
    await userStore.updateUser()
  } catch (e) {
    //Load login data only when the user is not logged in
    const loginResp = await Request.get(`/${import.meta.env.VITE_DEFAULT_RENDERER || "json"}/user/login`)
    const data = await loginResp.json()
    state.currentaction = data["action"]
    state.defaultProvider = data["values"]["provider"]

    if (state.currentaction === "select_authentication_provider_success" && data["next_url"]) {
      state.formByPass = data["next_url"]
    }
    let providers = {}
    for (const [k, v] of Object.entries(data["structure"]["provider"]["values"])) {
      const match = k.match(/auth_(.+?)\/login/)

      const extracted = match ? match[1] : null
      providers[extracted] = { target: k, name: v }
    }

    state.availableProviders = providers
  }
})

defineExpose({
  setCurrentAction,
})
</script>

<style scoped>
#google_oauth {
  display: flex;
  justify-content: center;
}

.wrapper {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-position: center center;
  background-size: cover;
  overflow: scroll;
}

.wrapper::before {
  content: "";
  opacity: 0.7;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 1;
  background: linear-gradient(to top left, var(--sl-color-primary-700), var(--sl-color-primary-500));
}

.background-img {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 0;

  & img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}

.logo {
  height: 160px;
  padding: var(--sl-spacing-medium);
  margin-bottom: var(--sl-spacing-medium);
  align-self: center;

  @media (max-width: 530px) {
    height: 140px;
    margin-bottom: var(--sl-spacing-small);
    padding: var(--sl-spacing-small);
  }
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  z-index: 10;
  min-width: 483px;
  max-width: 500px;
  background-color: var(--vi-background-color);
  width: 30vw;
  padding: var(--sl-spacing-large);
  border-radius: var(--sl-border-radius-medium);

  @media (max-width: 530px) {
    padding: var(--sl-spacing-medium);
    min-width: auto;
    width: calc(100% - var(--sl-spacing-2x-large));
    max-width: none;
  }

  sl-alert {
    margin-bottom: var(--sl-spacing-medium);
  }
}

.back {
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--sl-color-neutral-500);
  margin: var(--sl-spacing-x-small) 0;

  &:hover {
    color: var(--sl-color-neutral-700);
  }
}
.overlay {
  opacity: 0.8;
  position: absolute;
  width: 100%;
  height: 100%;
  background-color: var(--sl-color-neutral-100);
  top: 0;
  left: 0;
  display: flex;
  justify-content: center;
  align-items: center;

  & sl-spinner {
    font-size: 5rem;
  }
}
</style>
