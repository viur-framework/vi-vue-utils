<template>
  <Wrapper_nested
    :value="value"
    :name="name"
    :index="state.index"
    :disabled="boneState.bonestructure['readonly']"
    @change="changeEvent"
  >
  </Wrapper_nested>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, computed } from "vue"
//import Wrapper_nested from "../wrapper_nested.vue"

export default defineComponent({
  props: {
    name: String,
    value: null,
    index: Number,
    lang: String
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      value: {},
      index: computed(() => props.index),
      lang: computed(() => props.lang)
    })

    function changeEvent(data) {
      state.value[data.name] = data.value
      context.emit("change", props.name, state.value, props.lang, props.index, true)
    }

    onMounted(() => {
      context.emit("change", props.name, state.value, props.lang, props.index) //init
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
}
</style>
