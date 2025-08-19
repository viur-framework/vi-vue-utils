<template>
  <sl-input
    v-model="state.valueLat"
    class="widget-bone widget-bone-spatial widget-bone-spatial-default"
    :class="([`widget-bone-spatial-${name}`], [`widget-bone-spatial-${name}-lat`])"
    index="lat"
    type="number"
    :name="name"
    :min="boneState.bonestructure.boundslat[0]"
    :max="boneState.bonestructure.boundslat[1]"
    :disabled="boneState.readonly"
    value-as-number
    step="0.000001"
    :placeholder="state.placeholder"
    :data-user-invalid="boneState.errorMessages.length === 0 ? undefined : true"
    @sl-change="changeEvent"
  ></sl-input>

  <sl-input
    v-model="state.valueLng"
    class="widget-bone widget-bone-spatial widget-bone-spatial-default"
    :class="([`widget-bone-spatial-${name}`], [`widget-bone-spatial-${name}-long`])"
    index="lng"
    type="number"
    :name="name"
    :min="boneState.bonestructure.boundslng[0]"
    :max="boneState.bonestructure.boundslng[1]"
    :disabled="boneState.readonly"
    value-as-number
    step="0.000001"
    :placeholder="state.placeholder"
    :data-user-invalid="boneState.errorMessages.length === 0 ? undefined : true"
    @sl-change="changeEvent"
  ></sl-input>
</template>

<script setup>
import { reactive, onMounted, inject, computed } from "vue"
defineOptions({
  inheritAttrs: false,
})
const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String,
  bone: Object,
  autofocus: Boolean,
})

const emit = defineEmits(["change"])

const boneState = inject("boneState")
const state = reactive({
  valueLat: null,
  valueLng: null,
  placeholder: computed(() => {
    if (boneState.label !== "placeholder") return undefined
    let name = boneState?.bonestructure?.descr
    if (boneState.bonestructure.required) {
      name += "*"
    }
    return name
  }),
})

function changeEvent() {
  emit("change", props.name, [state.valueLat, state.valueLng], props.lang, props.index)
}

onMounted(() => {
  try {
    state.valueLat = props.value[0]
    state.valueLng = props.value[1]
  } catch (e) {}
  emit("change", props.name, [state.valueLat, state.valueLng], props.lang, props.index) //init
})
</script>

<style scoped>
sl-input {
  width: 100%;

  &:first-child {
    margin-bottom: 10px;

    &::part(base) {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
      border-top-right-radius: var(--sl-border-radius-medium);
    }

    @media (max-width: 900px) {
      &::part(base) {
        border-top-right-radius: 0;
      }
    }
  }

  &::part(base) {
    border-top-left-radius: 0;
    border-top-right-radius: 0;
  }
}
</style>
