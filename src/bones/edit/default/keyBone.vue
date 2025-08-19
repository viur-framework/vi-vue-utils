<template>
  <sl-input
    class="widget-bone widget-bone-key widget-bone-key-default"
    :class="[`widget-bone-key-${name}`]"
    disabled
    :value="value"
    :data-data-invalid="boneState.errorMessages.length === 0 ? undefined : true"
    @sl-change="changeEvent"
  ></sl-input>
</template>

<script setup>
import { reactive, onMounted, inject } from "vue"
defineOptions({
  inheritAttrs: false,
})
const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String,
  readonly: Boolean,
  params: Object,
  bone: Object,
  autofocus: Boolean,
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
sl-input {
  width: 100%;
}
</style>
