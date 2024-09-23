<template>
  <sl-spinner v-if="state.loading"></sl-spinner>
  <div
    v-else
    class="input-wrapper"
  >
    <sl-select
      :value="state.default"
      @sl-change="handleSelect"
    >
      <sl-option
        v-for="country in state.countryInfo"
        :key="country.code"
        :value="country.dialCode"
      >
        {{ country.emoji }}
      </sl-option>
    </sl-select>
    <sl-input
      ref="phoneBone"
      type="tel"
      :placeholder="$t('bones.phone.placeholder')"
      :disabled="boneState.readonly"
      :value="Utils.unescape(state.value)"
      :required="boneState.bonestructure.required"
      @sl-change="changeEvent"
      @keyup="changeEvent"
    >
    </sl-input>
  </div>
  <div style="margin-bottom: 100px"></div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, computed, watchEffect, ref } from "vue"
import { useTimeoutFn } from "@vueuse/core"
import Utils from "../../utils"
import { Request } from "../../../index.js"
import jsonData from "./country_information.json"

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    autofocus: Boolean
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      value: computed(() => props.value),
      loading: false,
      country: "",
      countryInfo: [],
      userInput: "",
      default: computed(() => {
        return props.value.split(" ")[0]
      })
    })

    const countryInformation = jsonData
    const phoneBone = ref(null)

    function changeEvent(event) {
      state.userInput = event.target.value
      context.emit("change", props.name, event.target.value, props.lang, props.index)
    }

    watchEffect(() => {
      if (phoneBone.value && phoneBone.value !== null && phoneBone !== null) {
        if (props.autofocus) {
          const { start } = useTimeoutFn(() => {
            phoneBone.value.focus()
          }, 600)

          start()
        }
        // if (!props.value.length) {
        //   context.emit("change", props.name, state.countryCode + props.value, props.lang, props.index) //init
        // }
      }
    })

    function handleSelect(e) {
      let value = ""
      if (typeof props.value === "string") {
        value = props.value
      } else value = state.userInput
      value = value.split(" ")[1]
      state.country = e.target.value
      context.emit("change", props.name, state.country + " " + value, props.lang, props.index) //init
    }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
      state.loading = true
      countryInformation.forEach((country) => {
        let temp = {}
        temp.name = country.name
        temp.code = country.code
        temp.emoji = country.emoji
        temp.dialCode = country.dialCodes ? country.dialCodes[0] : ""
        state.countryInfo.push(temp)
      })
      state.loading = false
      // let available_countries = []
    })

    return {
      state,
      Utils,
      boneState,
      changeEvent,
      phoneBone,
      countryInformation,
      handleSelect
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
      border-bottom-left-radius: var(--sl-border-radius-medium);
    }
  }
}
sl-select {
  max-width: 100px;
}
.input-wrapper {
  display: flex;
  gap: 0.5em;
}
</style>
