<template>
  <sl-switch
    :disabled="boneState.readonly"
    :checked="state.value"
    @sl-change="changeEvent"
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
  --spacing-inline: var(--sl-input-spacing-medium);
  border: 1px solid var(--sl-color-neutral-300);
  padding-inline: var(--spacing-inline) calc(var(--spacing-inline) / 2);
  border-top-right-radius: var(--sl-input-border-radius-medium);
  border-bottom-right-radius: var(--sl-input-border-radius-medium);
  --height: calc(var(--sl-input-height-medium) - 1em);
  --width: calc(1.7 * (var(--sl-input-height-medium) - 0.8em));
  --thumb-size: calc(var(--sl-input-height-medium) - 1em);
  height: var(--sl-input-height-medium);
  align-items: center;
  display: inline-flex;

  @media (max-width: 900px) {
    border-top-right-radius: 0;
    border-bottom-left-radius: var(--sl-border-radius-medium);
  }
}
</style>
