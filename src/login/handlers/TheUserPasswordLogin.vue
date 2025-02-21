<template>
    <vi-form 
        ref="ViFormRef"
        module="user"
        action="edit"
        :fetchUrl="state.currentUrl"
        label="placeholder"
        :layout="UserPasswordLoginLayout"
    >
    </vi-form>
    <sl-alert :open="state.showCustomError" variant="danger">
      <sl-icon slot="icon" name="x-lg"></sl-icon>
      {{ $t('login.login_error') }}
    </sl-alert>
    <sl-button
        v-if="['no', 'loading', 'error'].includes(userStore.state['user.loggedin'])"
        variant="primary"
        :loading="userStore.state['user.loggedin'] === 'loading'"
        type="submit"
        @click="userLogin"
    >
        {{ $t("login.login") }}
    </sl-button>

    <sl-button
        v-else
        @click="logout"
        >{{ $t("login.logout") }}
    </sl-button>

    <sl-bar style="width:100%"> 
        <span slot="right"
            class="forgot-pw"
            @click="userStore.recoverPassword()"
            >{{ $t('login.lost_password') }}
        </span>
    </sl-bar>

</template>

<script setup>
import { reactive, defineComponent, computed, ref, watchEffect, useTemplateRef, onMounted, onBeforeMount } from "vue"
import { useFocus } from "@vueuse/core"
import { useUserStore } from "../stores/user"
import ViForm from "../../forms/ViForm.vue"
import UserPasswordLoginLayout from "../layouts/UserPasswordLoginLayout.vue"

const ViFormRef = useTemplateRef('ViFormRef')
const userStore = useUserStore()

const state = reactive({
  currentUrl: "/vi/user/auth_userpassword/login",
  showCustomError:false
})

onBeforeMount(()=>{
  userStore.updateUser()
})

function userLogin() {
  state.showCustomError = false
    ViFormRef.value.sendData(state.currentUrl).then(async(resp)=>{
      console.log(ViFormRef.value.state)
      if (ViFormRef.value.state.actionname==="login" && ViFormRef.value.state.errors.length===0){
        state.showCustomError = true
      }
      else if (ViFormRef.value.state.actionparams){
        state.currentUrl = ViFormRef.value.state.actionparams['action_url']
        ViFormRef.value.fetchData(state.currentUrl)
      }
    })
}

</script>

<style scoped>
sl-button {
  width: 100%;

  &[disabled] {
    &::part(base) {
      opacity: 1;
    }
  }
}

.forgot-pw {
  cursor: pointer;
  font-size: 0.8rem;
  color: var(--sl-color-neutral-500);
  padding: 0 var(--sl-spacing-x-small);

  &:hover {
    color: var(--sl-color-neutral-700);
  }
}
</style>