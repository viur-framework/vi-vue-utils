<template>
  <sl-textarea v-if="boneState.bonestructure.type==='raw.json'"
    class="widget-bone widget-bone-raw widget-bone-raw-default"
    :class="([`widget-bone-raw-${name}`])"
    :disabled="boneState?.readonly"
    :value="typeof value === 'object'?JSON.stringify(value):value"
    @input="changeEvent"
    :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-textarea>
  <sl-textarea
    v-else
    class="widget-bone widget-bone-raw widget-bone-raw-default"
    :class="([`widget-bone-raw-${name}`])"
    :disabled="boneState?.readonly"
    :value="value"
    :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
    @input="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-textarea>
</template>

<script setup>
import { reactive, onMounted, inject } from "vue"
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
    })

    function changeEvent(event) {
      emit("change", props.name, event.target.value, props.lang, props.index)
    }

    onMounted(() => {
      emit("change", props.name, props.value, props.lang, props.index) //init
    })

</script>

<style scoped>
sl-textarea {
  width: 100%;
  &::part(base) {
    border-radius: var(--sl-border-radius-medium);
  }

  &::part(textarea) {
    background-color: var(--sl-color-neutral-0);
    border-radius: var(--sl-border-radius-medium);
  }
}
</style>
