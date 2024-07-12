<template>
  <sl-select
    :disabled="boneState.readonly"
    :value="state.value"
    hoist
    :multiple="boneState['bonestructure']['multiple']"
    max-options-visible="0"
    clearable
    @sl-change="changeEvent"
  >
    <sl-option
      v-for="value in boneState['bonestructure']['values']"
      :value="value[0]"
    >
      {{ value[1] }}
    </sl-option>
  </sl-select>
</template>

<script setup>
import { reactive, useAttrs, onMounted, inject, computed } from "vue"

const props = defineProps({
  name: String,
  value: null,
  index: Number,
  lang: String
})

const emit = defineEmits(["change"])
const attrs = useAttrs() // This hook collects all attributes that are not props

const boneState = inject("boneState")

const state = reactive({
  value: computed(() => {
    let val = props.value
    if (Array.isArray(props.value)) {
      val = val.filter((i) => boneState["bonestructure"]["values"].map((i) => i[0].toString()).includes(i))
      return val.map((i) => i.toString())
    }
    return props.value ? props.value.toString() : ""
  })
})

function changeEvent(event) {
  emit("change", props.name, event.target.value, props.lang, props.index)
}

onMounted(() => {
  emit("change", props.name, state.value, props.lang, props.index) //init
})
</script>

<style scoped>
sl-select {
  width: 100%;

  &::part(combobox) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  @media (max-width: 900px) {
    &::part(combobox) {
      border-top-right-radius: 0;
      border-bottom-left-radius: var(--sl-border-radius-medium);
    }
  }
}

sl-option {
  &::part(base) {
    transition: background-color ease 0.3s;
  }

  &:hover {
    &::part(base) {
      background-color: var(--sl-color-gray-200);
    }
  }
}
</style>
