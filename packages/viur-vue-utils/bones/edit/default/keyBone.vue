<template>
  <sl-input
    class="widget-bone widget-bone-key widget-bone-key-default"
    :class="([`widget-bone-key-${name}`])"
    disabled
    :value="value"
    @sl-change="changeEvent"
  ></sl-input>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted } from "vue"

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    readonly: Boolean,
    params: Object
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const state = reactive({})

    function changeEvent(event) {
      context.emit("change", props.name, event.target.value, props.lang, props.index)
    }

    onMounted(() => {
      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    return {
      state,
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
