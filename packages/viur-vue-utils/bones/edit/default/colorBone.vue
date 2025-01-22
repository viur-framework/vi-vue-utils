<template>
  <sl-color-picker
    class="widget-bone widget-bone-color widget-bone-color-default"
    :class="([`widget-bone-color-${name}`])"
    :disabled="boneState.readonly"
    :value="value"
    @sl-change="changeEvent"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-color-picker>
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
    const state = reactive({})

    function changeEvent(event) {
      context.emit("change", props.name, event.target.value, props.lang, props.index)
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
sl-color-picker {
  &::part(trigger) {
    border-radius: 0;
  }
}
</style>
