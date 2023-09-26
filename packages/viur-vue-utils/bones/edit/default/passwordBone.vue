<template>
  <sl-input
    v-model="state.value1"
    :disabled="boneState.readonly"
    :class="{ 'has-check': !boneState.readonly }"
    type="password"
    clearable
    password-toggle="true"
    @sl-change="changeEvent"
    @sl-clear="state.value1 = ''"
    @keyup="changeEvent"
  >
    <sl-icon
      slot="suffix"
      :name="state.equal ? 'check' : 'x'"
    ></sl-icon>
  </sl-input>
  <sl-input
    v-if="!boneState.readonly"
    v-model="state.value2"
    class="password-check"
    type="password"
    clearable
    password-toggle="true"
    @sl-change="changeEvent"
    @sl-clear="state.value2 = ''"
    @keyup="changeEvent"
  >
    <sl-icon
      slot="suffix"
      :name="state.equal ? 'check' : 'x'"
    ></sl-icon>
  </sl-input>
  <ul class="errors">
    <li v-for="error in state.passwordInfo">{{ error }}</li>
  </ul>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, computed, inject, watch } from "vue"

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      value1: "",
      value2: null,
      equal: false,
      passwordInfo: []
    })

    function changeEvent(event) {
      if (state.value1 === state.value2) {
        state.equal = true
      } else {
        state.equal = false
      }
      testPassword(state.value1)
      if (state.passwordInfo.length === 0) {
        context.emit("change", props.name, event.target.value, props.lang, props.index)
      }
    }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    function testPassword(password: string): string[] {
      state.passwordInfo = []
      for (const test: [string, string] of boneState.bonestructure["tests"]) {
        if (!new RegExp(test[0]).test(password)) {
          state.passwordInfo.push(test[1])
        }
      }
      if (!state.equal) {
        state.passwordInfo.push("Die eingegebenen Passwörter stimmen nicht überein.")
      }
      if (!state.value1) {
        state.passwordInfo.push("Das eingegebene Passwort ist leer.")
      }
    }

    watch(
      () => props.value,
      (newVal, oldVal) => {
        state.value1 = newVal
      }
    )

    return {
      state,
      boneState,
      changeEvent
    }
  }
})
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

.errors {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-gap: 2px 7px;
  margin-top: var(--sl-spacing-x-small);
  font-size: 0.7em;
  font-weight: bold;
}
</style>
