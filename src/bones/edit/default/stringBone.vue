<template>
  <sl-input
    class="widget-bone widget-bone-string widget-bone-string-default"
    :class="([`widget-bone-string-${name}`])"
    :name="name"
    ref="stringBone"
    :disabled="boneState.readonly"
    :value="Utils.unescape(value)"
    :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
    @sl-change="changeEvent"
    @keyup="changeEvent"
    :placeholder="state.placeholder"
    :data-user-invalid="boneState.errorMessages.length===0?null:true"
    :pattern="state.pattern"
    :maxlength="boneState.maxlength"
    :minlength="boneState.minlength"
  ></sl-input>
</template>

<script setup>
import { reactive, onMounted, inject, computed, watchEffect, ref } from "vue"
import { useTimeoutFn } from "@vueuse/core"
import Utils from "../../utils"
  defineOptions({
    inheritAttrs: false
  })
  const props = defineProps( {
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
      }),
      placeholder:computed(()=>{
        if (boneState.label!=='placeholder') return undefined
        let name = boneState?.bonestructure?.descr
        if (boneState.bonestructure.required){
          name +="*"
        }
        return name
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
      emit("change", props.name, event.target.value, props.lang, props.index, valid)
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
      emit("change", props.name, props.value, props.lang, props.index) //init
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
