<template>
  <sl-spinner v-if="state.loading"></sl-spinner>
  <div
    v-else
    class="input-wrapper"
  >
    <sl-select
      :value="state.dialCode"
      @sl-change="handleSelect"
      :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
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
      :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
      @sl-change="changeEvent"
      :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
    >
    </sl-input>
  </div>
</template>

<script setup>

import { reactive, onMounted, inject, computed, watchEffect, ref } from "vue"
import { useTimeoutFn } from "@vueuse/core"
import Utils from "../../utils"
import jsonData from "./country_information.json"
import parsePhoneNumber from "libphonenumber-js/min"
import { AsYouType, validatePhoneNumberLength } from "libphonenumber-js/min"
  defineOptions({
    inheritAttrs: false
  })
  const props = defineProps({
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    bone:Object,
    autofocus: Boolean
  })

  const emit = defineEmits( ["change"])

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
        emit("change", props.name, "", props.lang, props.index)
        return
      }
      if (event.target.value.length > 4) {
        const number = parsePhoneNumber(event.target.value, state.country)
        const valueFormatter = new AsYouType()

        let value = valueFormatter.input(number ? number.number : event.target.value)
        state.dialCode = "+" + number?.countryCallingCode
        emit("change", props.name, value, props.lang, props.index)
        return
      } else return

    }

    watchEffect(() => {
      if (phoneBone.value && phoneBone.value !== null && phoneBone !== null) {
        if (props.autofocus) {
          const { start } = useTimeoutFn(() => {
            phoneBone.value.focus()
          }, 600)

          start()
        }
      }
    })

    function handleSelect(e) {
      state.dialCode = e.target.value
      changeEvent({ target: { value: state.value } })
    }

    function getCountry(dialCode) {
      let result = state.countryInfo.filter((country) => country.dialCode === dialCode)
      result = result[0] ? result[0].code : "DE"
      return result
    }

    function getDefaultCode() {
      let defaultDialCode = boneState.bonestructure.default_country_code
        ? boneState.bonestructure.default_country_code
        : "+49"

      state.dialCode = defaultDialCode
    }

    function getCode(value) {
      if (!value)
        return boneState.bonestructure.default_country_code ? boneState.bonestructure.default_country_code : "+49"
      return "+" + parsePhoneNumber(value).countryCallingCode
    }

    onMounted(() => {
      emit("change", props.name, props.value, props.lang, props.index) //init
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
      state.dialCode = getCode(props.value)
      // let available_countries = []
    })

</script>

<style scoped>
sl-input {
  width: 100%;
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
