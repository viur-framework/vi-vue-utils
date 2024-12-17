<template>
  <sl-switch
    class="widget-bone widget-bone-boolean widget-bone-boolean-default"
    :class="([`widget-bone-boolean-${name}`])"
    :disabled="boneState.readonly"
    :checked="state.value"
    @sl-change="changeEvent"
    :data-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-switch>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, computed } from "vue"

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
      value: computed(() => {
        return ![false, null, undefined, ""].includes(props.value)
      })
    })

    function changeEvent(event) {
      context.emit("change", props.name, event.target.checked, props.lang, props.index)
    }

    onMounted(() => {
      let val = props.value
      if (!val) {
        val = false
      }
      context.emit("change", props.name, val, props.lang, props.index) //init
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
sl-switch {
  border: 1px solid var(--sl-color-neutral-300);
  padding: 0.4em 0.1em 0.4em 0.4em;
  border-top-right-radius: var(--sl-input-border-radius-medium);
  border-bottom-right-radius: var(--sl-input-border-radius-medium);
  --height: calc(var(--sl-input-height-medium) - 1em);
  --width: calc(1.7 * (var(--sl-input-height-medium) - 0.8em));
  --thumb-size: calc(var(--sl-input-height-medium) - 1em);

  @media (max-width: 900px) {
    border-top-right-radius: 0;
    border-bottom-left-radius: var(--sl-border-radius-medium);
  }
}
</style>
