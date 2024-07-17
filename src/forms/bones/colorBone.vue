<template>
  <sl-color-picker
    :disabled="boneState.readonly"
    :value="value"
    @sl-change="changeEvent"
  ></sl-color-picker>
</template>

<script setup>
import { reactive, onMounted, inject } from "vue"

const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String
})

const emit = defineEmits(["change"])

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
sl-color-picker {
  &::part(trigger) {
    border-radius: 0;
  }
}
</style>
