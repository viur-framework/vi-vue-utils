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

<script>
import { reactive, defineComponent, onMounted, inject, computed, getCurrentInstance } from "vue"
import Wrapper_nested from "../wrapper_nested.vue"

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: String,
    value: null,
    index: Number,
    lang: String
  },
  components: { Wrapper_nested },
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      value: {},
      index: computed(() => props.index),
      lang: computed(() => props.lang)
    })

    function changeEvent(data) {
      if (!state.value?.[data.name]) {
        if (!state.value) {
          state.value = { [data.name]: null }
        } else {
          state.value[data.name] = null
        }
      }

      let currentBone = state.value[data.name]
      if (data.lang) {
        if (currentBone === null) currentBone = {}
        if (Object.keys(currentBone).includes(data.lang) && data.index !== null) {
          currentBone[data.lang][data.index] = data.value
        } else {
          currentBone[data.lang] = data.value
        }
      } else if (data.index !== null) {
        if (currentBone === null) currentBone = []
        currentBone[data.index] = data.value
      } else {
        currentBone = data.value
      }
      state.value[data.name] = currentBone

      context.emit("change", props.name, state.value, props.lang, props.index, true)
    }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
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
