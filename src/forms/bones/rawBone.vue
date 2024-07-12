<template>
  <sl-textarea
    v-if="boneState.bonestructure.type === 'raw.json'"
    :disabled="boneState?.readonly"
    :value="JSON.stringify(value)"
    @input="changeEvent"
  ></sl-textarea>
  <sl-textarea
    v-else
    :disabled="boneState?.readonly"
    :value="value"
    @input="changeEvent"
  ></sl-textarea>
</template>

<script setup>
import { reactive, useAttrs, onMounted, inject } from "vue"

const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String
})

const emit = defineEmits(["change"])
const attrs = useAttrs() // This hook collects all attributes that are not props

const boneState = inject("boneState")

const state = reactive({})

function changeEvent(event) {
  emit("change", props.name, event.target.value, props.lang, props.index)
}

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
