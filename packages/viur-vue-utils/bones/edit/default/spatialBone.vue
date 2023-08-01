<template>
  <div
    v-for="(val, index) in state.spatialValue"
    :key="index"
  >
    {{ index }} {{ name }} {{ val }}
    <sl-input
      v-model="state.spatialValue[index]"
      :index="index"
      type="number"
      :name="name"
      :min="boneState.bonestructure.boundslat[0]"
      :max="boneState.bonestructure.boundslat[1]"
      :disabled="boneState.readonly"
      value-as-number
      step="0.1"
      @sl-change="changeEvent"
    ></sl-input>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject } from "vue"

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      valueLat: null,
      valueLng: null,
      spatialValue: {
        lat: null,
        lng: null
      }
    })
    function ValueInObject(value) {
      if (value !== null) {
        if (Array.isArray(value) && value.length === 2) {
          state.spatialValue = {
            lat: value[0],
            lng: value[1]
          }
        }
      }
    }

    function changeEvent() {
      context.emit("change", props.name, state.spatialValue, props.lang, props.index)
    }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
      if (props.value) {
        state.spatialValue = {
          lat: props.value[0],
          lng: props.value[1]
        }
        props.value = state.spatialValue
      }
    })

    return {
      state,
      boneState,
      changeEvent
    }
  }
})
</script>

<style scoped>
sl-input {
  width: 100%;

  &::part(base) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
