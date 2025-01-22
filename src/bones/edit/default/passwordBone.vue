<template>
  <sl-input
    class="widget-bone widget-bone-password widget-bone-password-default"
    :class="([`widget-bone-password-${name}`]),{ 'has-check': !boneState.readonly }"
    ref="passwordBone"
    v-model="state.value1"
    :disabled="boneState.readonly"
    type="password"
    clearable
    password-toggle="true"
    @sl-change="changeEvent"
    @sl-clear="state.value1 = ''"
    @keyup="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  >
    <sl-icon
      slot="suffix"
      :name="state.equal && state.value1.length ? 'check' : 'x'"
    ></sl-icon>
  </sl-input>
  <sl-input
    class="widget-bone widget-bone-boolean widget-bone-boolean-default widget-bone-boolean-repeat password-check"
    :class="([`widget-bone-boolean-${name}`])"
    v-if="!boneState.readonly"
    v-model="state.value2"
    type="password"
    clearable
    password-toggle="true"
    @sl-change="changeEvent"
    @sl-clear="state.value2 = ''"
    @keyup="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  >
    <sl-icon
      slot="suffix"
      :name="state.equal && state.value1.length ? 'check' : 'x'"
    ></sl-icon>
  </sl-input>

  <ul class="errors">
    <li
      v-for="(error, index) in state.passwordInfo"
      :key="index"
    >
      {{ error }}
    </li>
    <li
      v-for="(error, index) in state.requiredPasswordInfo"
      :key="index"
      class="requiredInfo"
    >
      {{ error }}
    </li>
  </ul>
</template>

<script setup>

import { reactive,  onMounted, computed, inject, watch, ref, watchEffect } from "vue"
import { useTimeoutFn } from "@vueuse/core"

  const props = defineProps({
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    autofocus: Boolean
  })

  const emit=defineEmits( ["change"])

    const boneState = inject("boneState")
    const state = reactive({
      value1: "",
      value2: null,
      equal: false,
      passwordInfo: [],
      requiredPasswordInfo: []
    })

    const passwordBone = ref(null)

    function changeEvent(event) {
      testPassword(state.value1)

      if (state.value1 === state.value2) {
        state.equal = true
      } else {
        state.equal = false
       // dont try to update if not equal
      }

      // boneState.bonestructure["test_threshold"] = 2  *needs to be removed by the look cuz overridees server settings
      if (
        state.requiredPasswordInfo.length === 0 &&
        state.passwordInfo.length - state.requiredPasswordInfo.length <= boneState.bonestructure["test_threshold"]
      ) {
        emit("change", props.name, state.value1, props.lang, props.index, true)
      } else {
        emit("change", props.name, state.value1, props.lang, props.index, false)
      }
    }

    onMounted(() => {
      emit("change", props.name, props.value, props.lang, props.index) //init
    })

    function testPassword(password) {
      state.passwordInfo = []
      state.requiredPasswordInfo = []
      for (const test of boneState.bonestructure["tests"]) {
        if (!new RegExp(test[0]).test(password)) {
          if (test[2]) {
            state.requiredPasswordInfo.push(test[1])
          } else {
            state.passwordInfo.push(test[1])
          }
        }
      }
      if (!state.equal) {
        state.requiredPasswordInfo.push("Die eingegebenen Passwörter stimmen nicht überein.")
      }
      if (!state.value1) {
        state.requiredPasswordInfo.push("Das eingegebene Passwort ist leer.")
      }
    }

    watchEffect(() => {
      if (props.autofocus) {
        if (passwordBone.value && passwordBone.value !== null && passwordBone !== null) {
          const { start } = useTimeoutFn(() => {
            passwordBone.value.focus()
          }, 600)

          start()
        }
      }
    })

    watch(
      () => props.value,
      (newVal, oldVal) => {
        state.value1 = newVal
      }
    )

</script>

<style scoped>
sl-input {
  width: 100%;

  &::part(base) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  @media (max-width: 900px) {
    &::part(base) {
      border-top-right-radius: 0;
    }
  }
}

.has-check {
  &::part(base) {
    border-bottom-right-radius: 0;
  }
}

.password-check {
  margin-top: var(--sl-spacing-x-small);

  &::part(base) {
    border-top-right-radius: 0;
    border-bottom-left-radius: var(--sl-border-radius-medium);
  }
}
.pw-legend {
  display: flex;
  justify-content: space-between;
  align-content: flex-start;
  align-items: flex-start;
  gap: 0rem;
  font-size: 0.75rem;
  padding: 0.25em;
}
span {
  margin: 0;
  padding: 0;
  font-style: italic;
}
.errors {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-gap: 2px 7px;
  margin-top: var(--sl-spacing-x-small);
  font-size: 0.7em;
  font-weight: bold;
}

.requiredInfo {
  color: var(--sl-color-danger-500);
}
</style>
