<template>
    <div v-if="state.activeHandler==='providerselection'">
      <vi-form
          ref="ViFormRef"
          module="user"
          action="login"
          :fetchUrl="state.currentUrl"
          label="placeholder"
          :layout="ProviderSelectionLayout"
          @change="console.log($event)"
      >
      </vi-form>
      <sl-alert :open="state.showCustomError" variant="danger">
        <sl-icon slot="icon" name="x-lg"></sl-icon>
        {{ $t('login.login_error') }}
      </sl-alert>
    </div>
    <div v-else>

    </div>



</template>

<script setup>
import { reactive, defineComponent, computed, ref, watchEffect, useTemplateRef, onMounted, onBeforeMount } from "vue"
import { useFocus } from "@vueuse/core"
import { useUserStore } from "../../stores/user"
import ViForm from "../../../forms/ViForm.vue"
import ProviderSelectionLayout from "../layouts/ProviderSelectionLayout.vue";

const ViFormRef = useTemplateRef('ViFormRef')
const userStore = useUserStore()




const state = reactive({
  currentUrl: "/vi/user/login",
  showCustomError:false,
  providerselection:null,
  activeHandler:"providerselection"
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