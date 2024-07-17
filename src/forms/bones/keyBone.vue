<template>
  <sl-input
    disabled
    :value="value"
    @sl-change="changeEvent"
  ></sl-input>
</template>

<script setup>
import { reactive, onMounted } from "vue"

const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String,
  readonly: Boolean,
  params: Object
})

const emit = defineEmits(["change"])

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
}
</style>
