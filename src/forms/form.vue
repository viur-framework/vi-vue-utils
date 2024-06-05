<template></template>

<script setup>
import bone from "../bones/edit/bone.vue"
import Loader from "../generic/Loader.vue"
import { reactive, defineProps, defineEmits } from "vue"

defineEmits(["change"])
const props = defineProps({
  module: {
    type: String,
    required: true
  },
  action: null,
  group: null,
  skelkey: null,
  skeltype: null,
  secure: {
    type: Boolean,
    default: true
  },
  bones: {
    type: Array,
    default: []
  },
  values: {
    type: Object,
    default: null
  },
  renderer: {
    type: String,
    default: import.meta.env.VITE_DEFAULT_RENDERER || "vi"
  },
  errors: []
})

const state = reactive({
  skel: {},
  structure: {},
  errors: []
})
</script>

<style scoped></style>
