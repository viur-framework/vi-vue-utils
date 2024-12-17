<template>
  <sl-input
    class="widget-bone widget-bone-spatial widget-bone-spatial-default"
    :class="([`widget-bone-spatial-${name}`],[`widget-bone-spatial-${name}-lat`])"
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
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr+' lat':undefined"
    :data-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-input>

  <sl-input
    class="widget-bone widget-bone-spatial widget-bone-spatial-default"
    :class="([`widget-bone-spatial-${name}`],[`widget-bone-spatial-${name}-long`])"
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
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr+' long':undefined"
    :data-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-input>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject } from "vue"

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: String,
    value: [Object, String, Number, Boolean, Array],
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
