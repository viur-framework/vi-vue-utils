<template>
  <sl-input
    class="widget-bone widget-bone-string widget-bone-string-default"
    :class="([`widget-bone-string-${name}`])"
    :name="name"
    ref="stringBone"
    :disabled="boneState.readonly"
    :value="Utils.unescape(value)"
    :required="boneState.bonestructure.required"
    @sl-change="changeEvent"
    @keyup="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-user-invalid="boneState.errorMessages.length===0?null:true"
    :pattern="state.pattern"
    :maxlength="boneState.maxlength"
    :minlength="boneState.minlength"
  ></sl-input>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, computed, watchEffect, ref } from "vue"
import { useTimeoutFn } from "@vueuse/core"
import Utils from "../../utils"

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
      valid: null,
      pattern: computed(() => {
        let pat = boneState.params?.pattern
        if (!pat) return undefined

        if (typeof(pat) === "String"){
          return pat
        }
        return pat?.[boneState.defaultLanguage]
      }),
      pattern_error:computed(()=>{
        let pat = boneState.params?.pattern_error
        if (!pat) return ''

        if (typeof(pat) === "String"){
          return pat
        }
        return pat?.[boneState.defaultLanguage]?pat?.[boneState.defaultLanguage]:''
      })
    })

    const stringBone = ref(null)

    function changeEvent(event) {
      let valid = stringBone.value.reportValidity()
      let validStates = stringBone.value.validity
      if(validStates['patternMismatch']){
        stringBone.value.setCustomValidity(state.pattern_error)
      }else{
        stringBone.value.setCustomValidity('')
      }
      context.emit("change", props.name, event.target.value, props.lang, props.index, valid)
    }

    watchEffect(() => {
      if (props.autofocus) {
        if (stringBone.value && stringBone.value !== null && stringBone !== null) {
          const { start } = useTimeoutFn(() => {
            stringBone.value.focus()
          }, 600)

          start()
        }
      }
    })

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    return {
      state,
      Utils,
      boneState,
      changeEvent,
      stringBone
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
</style>
