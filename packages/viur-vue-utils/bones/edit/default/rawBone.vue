<template>
  <sl-textarea v-if="boneState.bonestructure.type==='raw.json'"
    class="widget-bone widget-bone-raw widget-bone-raw-default"
    :class="([`widget-bone-raw-${name}`])"
    :disabled="boneState?.readonly"
    :value="JSON.stringify(value)"
    @input="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-textarea>
  <sl-textarea
    v-else
    class="widget-bone widget-bone-raw widget-bone-raw-default"
    :class="([`widget-bone-raw-${name}`])"
    :disabled="boneState?.readonly"
    :value="value"
    @input="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-textarea>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject } from "vue"

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
    })

    function changeEvent(event) {
      context.emit("change", props.name, event.target.value, props.lang, props.index)
    }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

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
      border-bottom-left-radius: var(--sl-border-radius-medium);
    }
  }
}
</style>
