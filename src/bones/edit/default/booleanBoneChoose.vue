<template>
  <sl-radio-group :value="state.value" @sl-change="changeEvent"
  class="widget-bone widget-bone-boolean widget-bone-boolean-choose"
  :class="([`widget-bone-boolean-${name}`])"
  :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
  :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  >
    <sl-radio :value="'true'" :disabled="boneState.readonly">{{ $t("bones.bool.true") }}</sl-radio>
    <sl-radio :value="'false'" :disabled="boneState.readonly">{{ $t("bones.bool.false") }}</sl-radio>
  </sl-radio-group>
</template>

<script setup>

import { reactive, onMounted, inject, computed } from "vue"
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
      value: computed(() => {
        return ""+![false, null, undefined, "", "false"].includes(props.value)
      })
    })

    function changeEvent(event) {
      emit("change", props.name, event.target.value, props.lang, props.index)
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
