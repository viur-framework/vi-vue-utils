<template>
  {{ getBoneValue(boneName, structure[boneName]["type"] === "date" ? "date" : null) }}
</template>

<script>
import boneLogic from "./display"
import { defineComponent } from "vue"

export default defineComponent({
  props: {
    boneName: String,
    skel: Object,
    structure: Object
  },
  setup(props, context) {
    const { getBoneValue, bones_state } = boneLogic(props.skel, props.structure)
    return { getBoneValue }
  }
})
</script>

<style scoped></style>
