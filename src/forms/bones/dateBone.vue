<template>
  <sl-input
    :disabled="boneState.readonly"
    :type="state.typeString"
    :value="state.value"
    @sl-change="changeEvent"
  ></sl-input>
</template>

<script setup>
import { reactive, onMounted, computed, inject } from "vue"

const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String
})

const emit = defineEmits(["change"])

const boneState = inject("boneState")

const state = reactive({
  value: computed(() => {
    // remove timezone data if timed
    let boneValue = props.value
    if (boneState.bonestructure["time"]) {
      boneValue = props.value?.split("+")[0]
    } else if (props.value) {
      //convert to readable value
      boneValue = new Date(props.value).toISOString().substr(0, 10)
    }

    return boneValue
  }),
  typeString: computed(() => {
    // Calculate the correct datetype String
    let typeString = "datetime-local"
    if (!boneState.bonestructure["time"]) {
      typeString = "date"
    }
    return typeString
  })
})

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
