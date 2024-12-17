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
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-input>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, ref, watchEffect } from "vue"
import { useTimeoutFn } from "@vueuse/core"

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
    const state = reactive({})

    const emailBone = ref(null)

    function changeEvent(event) {
      context.emit("change", props.name, event.target.value, props.lang, props.index)
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
      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    return {
      state,
      boneState,
      changeEvent,
      emailBone
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
