<template>
  {{ getBoneValue(boneName, structure[boneName]["type"] === "date" ? "date" : null) }}
</template>

<script setup>
import boneLogic from "./display"

const props = defineProps({
  boneName: String,
  skel: Object,
  structure: Object
})

const { getBoneValue, bones_state } = boneLogic(props.skel, props.structure)
</script>

<style scoped></style>
