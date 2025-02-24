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
        v-if="userStore.state.currentLoginMask !== 'secondFactor'"
        class="logo"
        :src="logo"
      />
      <!-- <sl-alert
        v-if="userStore.state['user.loggedin'] === 'error'"
        open
        variant="danger"
        duration="3000"
        @sl-hide="userStore.state['user.loggedin'] = 'no'"
      >
        {{ userStore.state.renderErrorMsg }}
      </sl-alert> -->

      <user-login-mask
        v-show="userStore.state.currentLoginMask === '' || userStore.state.currentLoginMask === 'user'"
        :username="state.name"
        @on-user-login="userLogin($event.name, $event.password)"
      >
      </user-login-mask>

      <div
        v-show="
          userStore.state.currentLoginMask !== 'secondFactor' &&
          userStore.state.currentLoginMask !== 'pwRecovery' &&
          userStore.state.currentLoginMask !== 'google' &&
          !isAppAuth
        "
        class="or"
      >
        {{ $t("login.or") }}
      </div>

      <div
        v-show="
          (userStore.state.currentLoginMask === '' ||
            userStore.state.currentLoginMask === 'google' ||
            userStore.state.currentLoginMask === 'user') &&
          !isAppAuth
        "
      >
        <div id="google_oauth"></div>
        <sl-alert
          v-if="userStore.state['user.loggedin'] === 'error' && userStore.state.currentLoginMask === 'google'"
          open
          variant="danger"
          duration="3000"
          closable
          @sl-hide="userStore.state['user.loggedin'] = 'no'"
        >
          {{ userStore.state.renderErrorMsg }}
        </sl-alert>

        <sl-button
          :loading="userStore.state['user.loggedin'] === 'loading' && userStore.state.currentLoginMask === 'google'"
          class="more-login-btn"
          @click="googleLogin"
        >
          <sl-icon
            slot="prefix"
            library="bootstrap"
            name="google"
            class="google-icon"
          >
          </sl-icon>
          {{ $t("login.with_google") }}
        </sl-button>
      </div>
      <slot></slot>

      <div v-if="userStore.state['user.loggedin'] === 'secound_factor_choice'">
        <div
          v-for="choice in userStore.state['user.login.secound_factor_choice']"
          :key="choice"
        >
          <sl-button @click="userSecondFactorStart(choice)">
            {{ choice["name"] }}
          </sl-button>
        </div>
      </div>
      <div
        v-else-if="userStore.state.currentLoginMask === 'secondFactor'"
        class="second-factor"
      >
        <template
          v-for="boneName in Object.keys(userStore.state['user.login.secound_factor']['structure'])"
          :key="boneName"
        >
          <img
            v-if="boneName === 'otptoken'"
            :src="tokenSvg"
            class="token"
          />
          <img
            v-else
            :src="logo"
            class="logo"
          />

          <form
            style="width: 100%"
            autocomplete="off"
            @submit.prevent="secondFactorSend"
          >
            <bone
              :is="getBoneWidget(userStore.state['user.login.secound_factor']['structure'][boneName]['type'])"
              v-show="userStore.state['user.login.secound_factor']['structure'][boneName]['visible']"
              :name="boneName"
              :structure="userStore.state['user.login.secound_factor']['structure']"
              :errors="userStore.state['user.login.secound_factor_errors']"
              :autofocus="true"
              :show-label-info="true"
              :skel="userStore.state['user.login.secound_factor']['values']"
              autocomplete="new-password"
              @change-internal="updateValue"
            >
            </bone>
            <sl-button
              class="more-login-btn"
              :variant="Object.keys(state.secondFactorFormdata).length > 0 ? 'primary' : 'disabled'"
              type="submit"
              :disabled="Object.keys(state.secondFactorFormdata).length <= 0"
              :loading="userStore.state['user.loggedin'] === 'loading'"
            >
              {{ boneName === "otptoken" ? "Token abschicken" : "Senden" }}
            </sl-button>
          </form>
        </template>
      </div>
      <div
        v-else-if="userStore.state.currentLoginMask === 'pwRecovery'"
        class="second-factor"
      >
        <form
          style="width: 100%"
          autocomplete="new-password"
          @submit.prevent="sendNewPassword(state.secondFactorFormdata)"
        >
          <template
            v-for="boneName in Object.keys(userStore.state['user.login.secound_factor']['structure'])"
            :key="boneName"
          >
            <bone
              :is="getBoneWidget(userStore.state['user.login.secound_factor']['structure'][boneName]['type'])"
              v-show="userStore.state['user.login.secound_factor']['structure'][boneName]['visible']"
              :name="boneName"
              :structure="userStore.state['user.login.secound_factor']['structure']"
              :errors="userStore.state['user.login.secound_factor_errors']"
              :autofocus="true"
              :show-label-info="true"
              :skel="userStore.state['user.login.secound_factor']['values']"
              autocomplete="new-password"
              @change-internal="updateRecoveryValue"
            >
            </bone>
            <sl-alert
              v-if="userStore.state['user.loggedin'] === 'error' && userStore.state.currentLoginMask === 'pwRecovery'"
              open
              variant="info"
              closable
            >
              <sl-icon
                slot="icon"
                name="exclamation-triangle"
              ></sl-icon>

              <div class="error-msg">
                {{ userStore.state.renderErrorMsg }}
              </div>
            </sl-alert>
            <sl-button
              v-if="
                boneName !== 'password' &&
                userStore.state['user.login.secound_factor']['structure'][boneName]['visible']
              "
              class="more-login-btn"
              variant="primary"
              type="submit"
              :loading="userStore.state['user.loggedin'] === 'loading'"
            >
              Senden
            </sl-button>
            <sl-button
              v-else-if="
                boneName === 'password' &&
                userStore.state['user.login.secound_factor']['structure'][boneName]['visible']
              "
              class="more-login-btn"
              :variant="state.secondFactorFormdata[boneName]?.length > 0 ? 'primary' : 'disabled'"
              type="submit"
              :disabled="state.secondFactorFormdata[boneName]?.length <= 0"
              :loading="userStore.state['user.loggedin'] === 'loading'"
            >
              Senden
            </sl-button>
          </template>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, computed, onBeforeMount, defineComponent, watch } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "./stores/user.js"
import Loader from "../generic/Loader.vue"
import { getBoneWidget } from "../bones/edit/index"
import UserLoginMask from "./dynamicRender/UserLoginMask.vue"

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

    const state = reactive({
      name: "",
      password: "",
      userDataFilled: computed(() => state.name && state.password),
      waitForLogout: false,
      waitFor: "init",
      otp: "",
      userPasswordLoginActivated: computed(() => {
        return (
          (userStore.state["user.login.type"] !== "user" && userStore.state["user.login.type"] !== "no") ||
          !userStore.state.primaryAuthMethods.has("X-VIUR-AUTH-User-Password")
        )
      }),
      userGoogleLoginActivated: computed(() => {
        return (
          (userStore.state["user.login.type"] !== "google" && userStore.state["user.login.type"] !== "no") ||
          !userStore.state.primaryAuthMethods.has("X-VIUR-AUTH-Google-Account")
        )
      }),
      secondFactorFormdata: {}
    })

    function googleLogin() {
      userStore.state.currentLoginMask = "google"
      state.waitForLogout = false
      userStore.googleLogin()
    }

    function logout() {
      state.waitForLogout = true
      userStore.logout()
    }

    function userLogin(name, password) {
      state.waitForLogout = false
      state.waitFor = "" //FIXME
      userStore.userLogin(name.trim(), password.trim())
    }
    function userSecondFactor() {
      state.waitForLogout = false
      userStore.userSecondFactor(state.otp)
    }
    function userSecondFactorStart(choice) {
      userStore.userSecondFactorStart(choice)
    }
    function updateValue(data) {
      if (data.value?.length > 0) {
        state.secondFactorFormdata[data.name] = data.value //Fixme can this broke
      } else {
        state.secondFactorFormdata = {}
      }
    }

    function updateRecoveryValue(data) {
      if (data.value?.length > 0) {
        state.secondFactorFormdata[data.name] = data.value //Fixme can this broke
      } else {
        delete state.secondFactorFormdata[data.name]
      }
    }

    function secondFactorSend() {
      if (Object.keys(state.secondFactorFormdata).length > 0) {
        userStore.state.currentLoginMask = "secondFactor"
        userStore.state["user.loggedin"] = "loading"
        userStore
          .secondFactorSend(state.secondFactorFormdata)
          .then((resp) => {
            state.secondFactorFormdata = {}
          })
          .catch((error) => {
            userStore.state["user.login.secound_factor"] = error
            userStore.state["user.loggedin"] = "secound_factor_input"
          })
      }
    }

    function publicAsset(path, prefix = "static") {
      if (import.meta.env.DEV) {
        return `${prefix}/${path}`
      }
      return `../${path}`
    }

    function sendNewPassword(data) {
      if (Object.keys(data).length > 0) {
        userStore.sendNewPassword(data)
      } else {
        userStore.state["user.loggedin"] = "error"
        userStore.state.renderErrorMsg = "Feld darf nicht leer sein!"
      }
    }

    watch(
      () => userStore.state.currentLoginMask,
      () => {
        if (userStore.state.currentLoginMask === "") {
          state.secondFactorFormdata = {}
        }
      }
    )

    onBeforeMount(async () => {
      await router.isReady()

      document.title = props.title

      // if (!props.isRedirect && userStore.state['user.loggedin'] === 'no') {
      //   state.waitFor = "login";
      // }

      userStore.getAuthMethods()

      userStore
        .updateUser()
        .then(() => {
          state.waitFor = "login"
        })
        .catch((error) => {
          state.waitFor = "login"
        })

      state.name = props.username ? props.username : ""
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

.input {
  flex: 1 1 auto;
  display: inline-flex;
  align-items: stretch;
  justify-content: start;
  position: relative;
  width: 100%;
  font-family: var(--sl-input-font-family);
  font-weight: var(--sl-input-font-weight);
  letter-spacing: var(--sl-input-letter-spacing);
  vertical-align: middle;
  overflow: hidden;
  cursor: text;
  border: solid var(--sl-input-border-width) var(--sl-input-border-color);
  border-radius: var(--sl-input-border-radius-medium);
  font-size: var(--sl-input-font-size-medium);
  box-shadow: none;
  color: var(--vi-foreground-color);
  background-color: var(--vi-background-color);
  border-color: var(--vi-border-color);
  height: calc(var(--sl-input-height-medium) - var(--sl-input-border-width) * 2);
  padding: 0 var(--sl-input-spacing-medium);
  margin: 0 0 var(--sl-spacing-x-small) 0;
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
</style>
