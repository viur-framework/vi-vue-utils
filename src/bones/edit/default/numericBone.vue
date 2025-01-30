<template>
  <sl-input
    class="widget-bone widget-bone-numeric widget-bone-numeric-default"
    :class="([`widget-bone-numeric-${name}`])"
    ref="numericBone"
    type="number"
    :disabled="boneState.readonly"
    :value="value"
    :min="state.minAmount"
    :max="state.maxAmount"
    :step="state.precision"
    :required="boneState.bonestructure.required"
    @sl-change="changeEvent"
    @keyup="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-data-invalid="boneState.errorMessages.length===0?undefined:true"
  >
  </sl-input>
  <ul class="info">
    <li v-if="state.minAmount !== -9223372036854776000 && state.minAmount">
      {{ $t("bones.numeric.min", { val: state.minAmount }) }}
    </li>
    <li v-if="state.maxAmount !== 9223372036854776000 && state.maxAmount">
      {{ $t("bones.numeric.max", { val: state.maxAmount }) }}
    </li>
    <li v-if="state.precision">{{ $t("bones.numeric.precision", { val: boneState.bonestructure["precision"] }) }}</li>
  </ul>
</template>

<script setup>
import { reactive, onMounted, computed, inject, ref, watchEffect } from "vue"
import { useTimeoutFn } from "@vueuse/core"
  defineOptions({
    inheritAttrs: false
  })
  const emit = defineEmits( ['change'])
  const props = defineProps({
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    bone:Object,
    autofocus: Boolean
  })

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
      let valid = numericBone.value.reportValidity()
      emit("change", props.name, event.target.value, props.lang, props.index,valid)
    }

    watchEffect(() => {
      if (props.autofocus) {
        if (numericBone.value && numericBone.value !== null && numericBone !== null) {
          const { start } = useTimeoutFn(() => {
            numericBone.value.focus()
          }, 600)

          start()
        }
      }
    })

    onMounted(() => {
      emit("change", props.name, "" + props.value, props.lang, props.index) //init
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
