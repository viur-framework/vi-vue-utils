<template>
  <sl-input
    ref="numericBone"
    type="number"
    :disabled="boneState.readonly"
    :value="value"
    :min="state.minAmount"
    :max="state.maxAmount"
    :step="state.precision"
    @sl-change="changeEvent"
    @keyup="changeEvent"
  >
  </sl-input>
  <ul class="info">
    <li v-if="state.minAmount !== -9223372036854776000">
      {{ $t("bones.numeric.min", { val: state.minAmount }) }}
    </li>
    <li v-if="state.maxAmount !== 9223372036854776000">
      {{ $t("bones.numeric.max", { val: state.maxAmount }) }}
    </li>
    <li v-if="state.precision">
      {{ $t("bones.numeric.precision", { val: boneState.bonestructure["precision"] }) }}
    </li>
  </ul>
</template>

<script setup>
import { reactive,  useAttrs, onMounted, computed, inject, ref, watchEffect } from "vue"
import { useTimeoutFn } from "@vueuse/core"

const props = defineProps({
  name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    autofocus: Boolean
})

const emit = defineEmits(["change"])
const attrs = useAttrs() // This hook collects all attributes that are not props

const boneState = inject("boneState")


    const state = reactive({
      minAmount: computed(() => {
        return boneState.bonestructure["minAmount"]
      }),
      maxAmount: computed(() => {
        return boneState.bonestructure["maxAmount"]
      }),
      precision: computed(() => {
        if (boneState.bonestructure["precision"] > 1) {
          return parseFloat(`0.${"0".repeat(boneState.bonestructure["precision"] - 1)}1`)
        }
        return undefined
      })
    })

    const numericBone = ref(null)

    function changeEvent(event) {
      emit("change", props.name, event.target.value, props.lang, props.index)
    }

    watchEffect(() => {
      if (props.autofocus) {
        if (numericBone.value && numericBone.value !== null) {
          const { start } = useTimeoutFn(() => {
            numericBone.value.focus()
          }, 600)

          start()
        }
      }
    })

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

.info {
  display: flex;
  gap: 2px 7px;
  margin-top: var(--sl-spacing-x-small);
  font-size: 0.7em;
  font-weight: bold;
}
</style>
