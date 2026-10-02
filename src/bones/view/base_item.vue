<template>
  {{ getBoneValue(boneName, state.option) }}
</template>

<script setup>
import boneLogic from "./boneLogic"
import { computed, defineComponent, reactive } from "vue"
import { useI18n } from "vue-i18n"

const props = defineProps({
  boneName: String,
  skel: Object,
  structure: Object,
})

const state = reactive({
  option: computed(() => {
    if (props.structure[props.boneName]["type"] === "date") {
      if (props.structure[props.boneName]["date"] && !props.structure[props.boneName]["time"]) {
        return "date"
      }

      if (props.structure[props.boneName]["time"] && !props.structure[props.boneName]["date"]) {
        return "time"
      }
    }
    return null
  }),
})

const { t } = useI18n()
const { getBoneValue, bones_state } = boneLogic(props.skel, props.structure, false, null, t)
</script>

<style scoped></style>
