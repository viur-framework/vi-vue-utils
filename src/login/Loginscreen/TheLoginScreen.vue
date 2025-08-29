<template>
  <div class="wrapper">
    <div class="background-img">
      <img :src="backgroundImage" />
    </div>
    <Loader
      v-if="state.waitFor === 'init' || (isRedirect && userStore.state['user.loggedin'] === 'yes')"
      class="loader"
      :logo="logo"
      :size="'7'"
    />

    <div v-else class="card">
      <img class="logo" :src="logo" />
      <span
        v-if="
          !['select_authentication_provider', 'select_authentication_provider_success'].includes(state.currentaction)
        "
        class="back"
        @click="state.currentaction = 'select_authentication_provider'"
      >
        {{ $t("login.back") }}
      </span>
      <sl-alert v-if="userStore.state['user.loggedin'] === 'loading' || state.loading" variant="info" open>
        <sl-spinner slot="icon"></sl-spinner>
        {{ $t("login.waiting") }}
      </sl-alert>

      <SelectAuthenticationProvider
        v-if="
          ['select_authentication_provider', 'select_authentication_provider_success'].includes(state.currentaction)
        "
      ></SelectAuthenticationProvider>

      <SelectSecondFactorsProvider
        v-if="['select_secondfactor_provider', 'select_secondfactor_provider_success'].includes(state.currentaction)"
      ></SelectSecondFactorsProvider>

      <UserPasswordRecover v-if="['pwrecover'].includes(state.currentaction)"></UserPasswordRecover>

      <div v-if="false && userStore.state['user.loggedin'] === 'loading'" class="overlay">
        <sl-spinner></sl-spinner>
      </div>
    </div>
  </div>
</template>

<script setup>
/*

http://localhost:8080/vi/user/getAuthMethods
> [["X-VIUR-AUTH-User-Password", "X-VIUR-2FACTOR-TimeBasedOTP"], ["X-VIUR-AUTH-Google-Account", null]]

>>> SEnd to
http://localhost:8080/vi/user/auth_userpassword/login

> FOrm (edit): otp
>params
action_name= otp
action_url: /vi/user/f2_timebasedotp/otp
name = "time bsed OTp"


http://localhost:8080/vi/user/auth_userpassword/pwrecover
> FORM

*/

import { reactive, computed, onBeforeMount, defineComponent, watch, provide } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "../stores/user.js"
import Loader from "../../generic/Loader.vue"
import { getBoneWidget } from "../../bones/edit/index"
import { Request } from "../../utils/request"
import SelectAuthenticationProvider from "./SelectAuthenticationProvider.vue"
import SelectSecondFactorsProvider from "./SelectSecondFactorsProvider.vue"
import UserPasswordRecover from "./providers/UserPassword/UserPasswordRecover.vue"

const props = defineProps({
  username: { type: String, default: "" },
  isAppAuth: Boolean,
  isRedirect: { type: Boolean, default: false },
  backgroundImage: { type: String, default: "" },
  logo: { type: String, default: "" },
  title: { type: String, default: "Login" },
  tokenSvg: { type: String, default: "" },
})

const userStore = useUserStore()
const router = useRouter()

const state = reactive({
  currentaction: "select_authentication_provider",
  defaultProvider: null,
  availableProviders: {},
  availableSecondfactors: {},
  loading: false,
})
provide("loginState", state)

onBeforeMount(() => {
  Request.get("/vi/user/login").then(async (resp) => {
    let data = await resp.json()
    state.currentaction = data["action"]
    state.defaultProvider = data["values"]["provider"]

    let providers = {}
    for (const [k, v] of Object.entries(data["structure"]["provider"]["values"])) {
      const match = k.match(/auth_(.+?)\/login/)
      const extracted = match ? match[1] : null
      providers[extracted] = { target: k, name: v }
    }

    state.availableProviders = providers
  })
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
