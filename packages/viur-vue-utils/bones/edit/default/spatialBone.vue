<template>
  <sl-input
    type="number"
    :name="name + '_lat'"
    :min="boneState.bonestructure.boundslat[0]"
    :max="boneState.bonestructure.boundslat[1]"
    :disabled="boneState.readonly"
    @sl-change="changeEvent"
    v-model="state.spatialValue['lat']"
    valueAsNumber
    step="0.1"
  ></sl-input>
  <sl-input
    type="number"
    :name="name + '_lng'"
    :min="boneState.bonestructure.boundslng[0]"
    :max="boneState.bonestructure.boundslng[1]"
    :disabled="boneState.readonly"
    @sl-change="changeEvent"
    v-model="state.spatialValue['lng']"
    valueAsNumber
    step="0.1"
  ></sl-input>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject } from "vue";

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String,
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState");
    const state = reactive({
      valueLat: null,
      valueLng: null,
      spatialValue: {
        "lat": null,
        "lng": null
      },
    });
    function ValueInObject(value) {
      if (value !== null) {
        if (Array.isArray(value) && value.length === 2){
          state.spatialValue = {
            "lat": value[0],
            "lng": value[1]
          }
        }
      }
    }

    function changeEvent() {


      context.emit("change", props.name, state.spatialValue, props.lang, props.index);
    }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index); //init
      ValueInObject(props.value)
    });

    return {
      state,
      boneState,
      changeEvent,
    };
  },
});
</script>

<style scoped lang="less">
sl-input {
  width: 100%;

  &::part(base) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
