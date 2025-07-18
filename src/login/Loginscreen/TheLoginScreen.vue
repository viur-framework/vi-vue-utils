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

    <div
      v-else
      class="card"
    >
      <img
        class="logo"
        :src="logo"
      />

      <span
        v-if="state.activeHandler!=='providerselection'"
        class="back"
        @click="userStore.recoverPassword()"
        >{{ $t('login.back') }}
    </span>

      <the-provider-selection></the-provider-selection>
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
import {Request} from '../../utils/request'
import TheProviderSelection from "./handlers/TheProviderSelection.vue"
import ThePasswordRecovery from "./handlers/ThePasswordRecovery.vue";
import TheGoogleLogin from "./handlers/TheGoogleLogin.vue";

  const props = defineProps( {
    username: { type: String, default: "" },
    isAppAuth: Boolean,
    isRedirect: { type: Boolean, default: false },
    backgroundImage: { type: String, default: "" },
    logo: { type: String, default: "" },
    title: { type: String, default: "Login" },
    tokenSvg: { type: String, default: "" }
  })


    const userStore = useUserStore()
    const router = useRouter()


const handlers = {
  providerselection:TheProviderSelection,
  googleaccount:TheGoogleLogin,
  pwrecover:ThePasswordRecovery
}


    const state = reactive({
        providerselection:null,
        activeHandler:"providerselection"
    })
  provide("loginState", state)

  onBeforeMount(()=>{
    Request.get("/vi/user/login").then(async(resp)=>{
      let data = await resp.json()



      console.log(data)
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

sl-button {
  width: 100%;

  &[disabled] {
    &::part(base) {
      opacity: 1;
    }
  }

  &.more-login-btn {
    &::part(base) {
      font-weight: 400;
    }
  }
}

sl-button.more-login-btn:has(+ #google_oauth > *) {
  display: none;
}

.card {
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

  sl-alert{
    margin-bottom: var(--sl-spacing-medium);
  }
}



.or {
  opacity: 0.5;
  padding: var(--sl-spacing-small) 0;
  margin: 0 auto;
  text-align: center;
  font-size: 0.9em;
}

.loader {
  z-index: 10000;
}

sl-tab-group {
  --indicator-color: var(--vi-foreground-color);
  --track-color: transparent;
}

sl-input {
  margin-bottom: 10px;
}

.second-factor {
  display: flex;
  flex-direction: column;
  align-items: center;

  & :deep(.bone-name) {
    background-color: transparent;
    padding: 0;
    margin-bottom: 0;
    height: auto;
    min-height: auto;
  }

  & :deep(.bone-wrapper) {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: var(--sl-spacing-medium);
    margin-bottom: var(--sl-spacing-medium);
  }

  & :deep(.bone-inner-wrap) {
    width: 100%;
  }

  & :deep(.bone-inner-wrap .info) {
    display: none;
  }

  & :deep(sl-input::part(base)) {
    border-bottom-left-radius: var(--sl-border-radius-medium) !important;
    border-top-left-radius: var(--sl-border-radius-medium) !important;
    border-top-right-radius: var(--sl-border-radius-medium) !important;
    border-bottom-right-radius: var(--sl-border-radius-medium) !important;
  }

  sl-alert{
    margin-bottom: 0;
  }
}

.token {
  margin-bottom: 10px;
}

/* Chrome, Safari, Edge, Opera */
sl-input::part(input)::-webkit-outer-spin-button,
sl-input::part(input)::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
sl-input::part(input)[type="number"] {
  -moz-appearance: textfield;
  appearance: textfield;
}

sl-alert{
  margin-bottom: var(--sl-spacing-medium);
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
</style>
