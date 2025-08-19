<template>
  <form autocomplete="on" @submit.prevent="userLogin">
    <sl-input ref="nameInput" v-model="state.name" :placeholder="$t('login.email')" name="username" required unwrap />
    <div class="input-wrapper">
      <sl-input
        v-model="state.password"
        :placeholder="$t('login.password')"
        name="current-password"
        type="password"
        password-toggle
        required
        unwrap
      />
      <span class="forgot-pw" @click="userStore.recoverPassword()">Passwort vergessen?</span>
    </div>

    <sl-alert v-if="userStore.state['user.loggedin'] === 'error'" open variant="info" closable>
      <sl-icon slot="icon" name="exclamation-triangle"></sl-icon>

      <div class="error-msg">
        {{ userStore.state.renderErrorMsg }}
      </div>
    </sl-alert>
    <sl-button
      v-if="['no', 'loading', 'error'].includes(userStore.state['user.loggedin'])"
      variant="primary"
      :loading="userStore.state['user.loggedin'] === 'loading'"
      type="submit"
    >
      {{ $t("login.login") }}
    </sl-button>
    <sl-button v-else @click="logout">{{ $t("login.logout") }}</sl-button>
  </form>
</template>

<script setup>
import { reactive, defineComponent, computed, ref, watchEffect } from "vue"
import { useTimeoutFn } from "@vueuse/core"
import { useUserStore } from "../stores/user"

const props = defineProps({
  username: { type: String, required: true },
})

const emit = defineEmits(["onUserLogin"])

const userStore = useUserStore()
const nameInput = ref(null)

const state = reactive({
  name: "",
  password: "",
  userDataFilled: computed(() => state.name && state.password),
})

function userLogin() {
  if (!state.name.length || !state.password.length) {
    return
  }
  emit("onUserLogin", { name: state.name, password: state.password })
}

watchEffect(() => {
  if (nameInput.value && nameInput.value !== null) {
    const { start } = useTimeoutFn(() => {
      if (props?.username.length) state.name = props?.username ? props.username : ""
      if (nameInput.value.value.length === 0 || nameInput.value.value.length < 1) nameInput.value.focus()
    }, 500)

    start()
  }
})
</script>

<style scoped>
sl-input {
  display: block;
  width: 100%;
  margin-bottom: var(--sl-spacing-x-small);
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
.input-wrapper {
  display: flex;
  flex-direction: column;
  margin: 0 0 var(--sl-spacing-large) 0;
  padding: 0 0 0;
}
.forgot-pw {
  cursor: pointer;
  align-self: flex-end;
  font-size: 0.8rem;
  color: var(--sl-color-primary-500);
  padding: 0 var(--sl-spacing-x-small);
  &:hover {
    color: var(--sl-color-primary-300);
  }
}
</style>
