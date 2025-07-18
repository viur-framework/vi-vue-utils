<template>

  <the-user-password-login v-if="Object.keys(boneState['bonestructure']['values']).includes('/vi/user/auth_userpassword/login')"></the-user-password-login>

  <template v-for="(name,url) in boneState['bonestructure']['values']">
      <template v-if="url !=='/vi/user/auth_userpassword/login'">
        <div class="or">
          {{ $t("login.or") }}
        </div>
        <sl-button class="more-login-btn" @click="changeEvent({target:{value:url}})">{{name}}</sl-button>
      </template>
  </template>
</template>

<script setup>
import TheUserPasswordLogin from "../handlers/TheUserPasswordLogin.vue"


import { reactive, onMounted, inject, computed } from "vue"
  defineOptions({
    inheritAttrs: false
  })
  const props = defineProps( {
    name: String,
    value: null,
    index: Number,
    lang: String,
    bone:Object,
    autofocus: Boolean
  })

  const emit = defineEmits( ["change"])

    const boneState = inject("boneState")
    const state = reactive({
      value: computed(() => {
        let val = props.value
        if (Array.isArray(props.value)) {
          if (boneState["bonestructure"]["values"] instanceof Array) {
            val = val.filter((i) => boneState["bonestructure"]["values"].map((i) => i[0].toString()).includes(i))
          } else
            val = val.filter((i) =>
              Object.keys(boneState["bonestructure"]["values"])
                .map((i) => i.toString())
                .includes(i)
            )

          return val.map((i) => i.toString())
        }
        return props.value ? props.value.toString() : ""
      })
    })


    function changeEvent(event) {
      emit("change", props.name, event.target.value, props.lang, props.index)
    }

    onMounted(() => {
      emit("change", props.name, state.value, props.lang, props.index) //init
    })

</script>

<style scoped>
.wrapper-multiple{
  display:flex;
  flex-direction: column;
}

sl-checkbox::part(control--checked) {
  background-color: var(--sl-color-success-600);
  border: 1px solid var(--sl-color-primary-600);
}
sl-checkbox::part(control--indeterminate) {
  background-color: var(--sl-color-success-600);
  border: 1px solid var(--sl-color-success-600);
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

.or {
  opacity: 0.5;
  padding: var(--sl-spacing-small) 0;
  margin: 0 auto;
  text-align: center;
  font-size: 0.9em;
}
</style>
