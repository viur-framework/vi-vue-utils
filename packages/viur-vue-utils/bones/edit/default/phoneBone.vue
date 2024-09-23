<template>
  <sl-spinner v-if="state.loading"></sl-spinner>
  <div
    v-else
    class="input-wrapper"
  >
    <!-- <sl-select
      v-model="state.country"
      @sl-change="handleSelect"
    >
      <sl-option
        v-for="language in boneState.bonestructure.countries"
        :key="language"
        :value="language"
      >
        {{ state.countries[language].flag }}
      </sl-option>
    </sl-select> -->
    {{ state.countryCode }}
    <sl-input
      ref="phoneBone"
      :disabled="boneState.readonly"
      :value="Utils.unescape(value)"
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
      countries: {},
      country: "",
      loading: false
    })

    const phoneBone = ref(null)

    function changeEvent(event) {
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

    // function handleSelect(e) {
    //   let value = props.value
    //   value = value.replace(state.countryCode, "")

    //   state.country = e.target.value
    //   context.emit("change", props.name, state.countryCode + value, props.lang, props.index) //init
    // }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
      // let available_countries = []
      state.loading = true
      state.countries = boneState.bonestructure.countries
      state.loading = false
    })

    return {
      state,
      Utils,
      boneState,
      changeEvent,
      phoneBone,
      // handleSelect
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
