<template>
  <sl-switch
    class="widget-bone widget-bone-boolean widget-bone-boolean-default"
    :class="([`widget-bone-boolean-${name}`])"
    :disabled="boneState.readonly"
    :checked="state.value"
    @sl-change="changeEvent"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-switch>
</template>

<script setup>
import { reactive, onMounted, inject, computed } from "vue"
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
      value: computed(() => {
        return ![false, null, undefined, ""].includes(props.value)
      })
    })

    function changeEvent(event) {
      emit("change", props.name, event.target.checked, props.lang, props.index)
    }

    onMounted(() => {
      let val = props.value
      if (!val) {
        val = false
      }
      emit("change", props.name, val, props.lang, props.index) //init
    })

</script>

<style scoped>
sl-switch {
  width: 100%;
  border: 1px solid var(--vi-border-color);
  padding: 0.4em 0.1em 0.4em 0.4em;
  border-radius: var(--sl-input-border-radius-medium);
  --height: calc(var(--sl-input-height-medium) - 1em);
  --width: calc(1.7 * (var(--sl-input-height-medium) - 0.8em));
  --thumb-size: calc(var(--sl-input-height-medium) - 1em);
}
</style>
