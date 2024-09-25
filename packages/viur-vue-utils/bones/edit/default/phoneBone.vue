<template>
  <sl-spinner v-if="state.loading"></sl-spinner>
  <div
    v-else
    class="input-wrapper"
  >
    <sl-select
      :value="state.dialCode"
      @sl-change="handleSelect"
    >
      <sl-option
        v-for="country in state.countryInfo"
        :key="country.currentCode"
        :value="country.dialCode"
      >
        {{ country.emoji }}
      </sl-option>
    </sl-select>
    <sl-input
      ref="phoneBone"
      type="tel"
      :disabled="boneState.readonly"
      :value="Utils.unescape(state.value)"
      :required="boneState.bonestructure.required"
      @sl-change="changeEvent"
    >
    </sl-input>
  </div>
  {{ getCountry(state.country) }}
  <div style="height: 100px"></div>
</template>

<script lang="ts">
//@ts-nocheck

import { reactive, defineComponent, onMounted, inject, computed, watchEffect, ref } from "vue"
import { useTimeoutFn } from "@vueuse/core"
import Utils from "../../utils"
import jsonData from "./country_information.json"
import parsePhoneNumber from "libphonenumber-js/min"
import { AsYouType, validatePhoneNumberLength } from "libphonenumber-js/min"

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
      value: computed(() =>
        props.value
          ? parsePhoneNumber(state.reference, getCountry(state.dialCode)).formatInternational()
          : state.dialCode + ""
      ),
      loading: false,
      reference: computed(() => parsePhoneNumber(props.value, getCountry(state.dialCode)).formatNational()),
      country: computed(() => getCountry(state.dialCode)),
      dialCode: "",
      countryInfo: []
    })

    const countryInformation = ref(jsonData)
    const phoneBone = ref(null)

    function changeEvent(event) {
      if (!event.target.value) {
        context.emit("change", props.name, "", props.lang, props.index)
        return
      }
      console.log("hier", event.target.value.length)
      if (event.target.value.length > 4) {
        const number = parsePhoneNumber(event.target.value, state.country)
        const valueFormatter = new AsYouType()

        let value = valueFormatter.input(number ? number.number : event.target.value)
        state.dialCode = "+" + number?.countryCallingCode
        context.emit("change", props.name, value, props.lang, props.index)
        return
      }
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
      state.dialCode = e.target.value
      // changeEvent({ target: { value: state.value } })
    }

    function getCountry(dialCode) {
      let result = state.countryInfo.filter((country) => country.dialCode === dialCode)
      return result.length ? result[0].code : []
    }

    function getDefaultCode() {
      let defaultDialCode = boneState.bonestructure.default_country_code
        ? boneState.bonestructure.default_country_code
        : "+49"

      state.dialCode = defaultDialCode
    }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
      state.loading = true
      countryInformation.value.forEach((country) => {
        let temp = {}
        temp.name = country.name
        temp.code = country.code
        temp.emoji = country.emoji
        temp.dialCode = country.dialCodes ? country.dialCodes[0] : ""
        state.countryInfo.push(temp)
      })
      state.loading = false

      getDefaultCode()

      // let available_countries = []
    })

    return {
      state,
      Utils,
      boneState,
      changeEvent,
      phoneBone,
      countryInformation,
      handleSelect,
      getCountry
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

  &&::part(listbox) {
    height: auto;
    max-height: 300px;
    z-index: 9999;
  }
}

sl-option {
}
.input-wrapper {
  display: flex;
  gap: 0.5em;
}
</style>
