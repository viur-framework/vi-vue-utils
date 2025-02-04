<template>
  <sl-input
    class="widget-bone widget-bone-email widget-bone-email-default"
    :class="([`widget-bone-email-${name}`])"
    :name="name"
    ref="emailBone"
    :disabled="boneState.readonly"
    type="email"
    :value="value"
    @sl-change="changeEvent"
    :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.language"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-input>
</template>

<script setup>
import { reactive, onMounted, inject, ref, watchEffect } from "vue"
import { useTimeoutFn } from "@vueuse/core"
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
    const state = reactive({})

    const emailBone = ref(null)

    function changeEvent(event) {
      emit("change", props.name, event.target.value, props.lang, props.index)
    }

    watchEffect(() => {
      if (props.autofocus) {
        if (emailBone.value && emailBone.value !== null && emailBone !== null) {
          const { start } = useTimeoutFn(() => {
            emailBone.value.focus()
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
