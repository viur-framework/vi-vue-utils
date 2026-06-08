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
import { reactive, onMounted, inject, computed, watch } from "vue"
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
const formState = inject("formState")

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
  isVisible: computed(() => {
    const visibleIf = boneState.bonestructure?.params?.visibleIf
    if (!visibleIf) return true
    return evaluateVisibleIf(visibleIf, formState?.skel ?? {})
  }),
})

watch(() => state.isVisible, () => emitCurrentValue())

watch(
  () => props.value,
  (newVal) => {
    state.valueLat = newVal?.[0] ?? null
    state.valueLng = newVal?.[1] ?? null
    if (!state.isVisible) emitCurrentValue()
  }
)

function evaluateVisibleIf(expression, skel) {
  const trimmed = expression.trim()
  const eqMatch = trimmed.match(/^(\w+)==(.+)$/)
  if (eqMatch) return String(skel[eqMatch[1]]) === eqMatch[2].trim()
  const neqMatch = trimmed.match(/^(\w+)!=(.+)$/)
  if (neqMatch) return String(skel[neqMatch[1]]) !== neqMatch[2].trim()
  return true
}

function changeEvent() {
  if (!state.isVisible) return
  emit("change", props.name, [state.valueLat, state.valueLng], props.lang, props.index)
}

function emitCurrentValue() {
  if (state.isVisible) {
    emit("change", props.name, [state.valueLat, state.valueLng], props.lang, props.index)
  } else {
    emit("change", props.name, null, props.lang, props.index)
  }
}

onMounted(() => {
  state.valueLat = props.value?.[0] ?? null
  state.valueLng = props.value?.[1] ?? null
  emitCurrentValue()
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
