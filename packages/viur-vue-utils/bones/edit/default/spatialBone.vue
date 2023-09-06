<template>
  <sl-input
    v-model="state.valueLat"
    index="lat"
    type="number"
    :name="name"
    :min="boneState.bonestructure.boundslat[0]"
    :max="boneState.bonestructure.boundslat[1]"
    :disabled="boneState.readonly"
    value-as-number
    step="0.000001"
    @sl-change="changeEvent"
  ></sl-input>

  <sl-input
    v-model="state.valueLng"
    index="lng"
    type="number"
    :name="name"
    :min="boneState.bonestructure.boundslat[0]"
    :max="boneState.bonestructure.boundslat[1]"
    :disabled="boneState.readonly"
    value-as-number
    step="0.000001"
    @sl-change="changeEvent"
  ></sl-input>
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
      valueLng: null
    })

    function changeEvent() {
      context.emit("change", props.name, [state.valueLat, state.valueLng], props.lang, props.index)
    }

    onMounted(() => {
      try {
        state.valueLat = props.value[0]
        state.valueLng = props.value[1]
      } catch (e) {}
      context.emit("change", props.name, [state.valueLat, state.valueLng], props.lang, props.index) //init
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
