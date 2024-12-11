<template>
  <sl-input
    class="widget-bone widget-bone-date widget-bone-date-default"
    :class="([`widget-bone-date-${name}`])"
    :disabled="boneState.readonly"
    :type="state.typeString"
    :name="name"
    :value="state.value"
    @sl-change="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
  ></sl-input>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, computed, inject } from "vue"

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
      value: computed(() => {
        // remove timezone data if timed
        let boneValue = props.value
        if (boneState.bonestructure["time"] && boneState.bonestructure["date"]) {
          boneValue = props.value?.split("+")[0]
        } else if (boneState.bonestructure["time"]){
          boneValue = props.value?.split("+")[0]?.split("T")[1]
        } else if (props.value) {
          //convert to readable value
          boneValue = new Date(props.value).toISOString().substr(0, 10)
        }

        return boneValue
      }),
      typeString: computed(() => {
        // Calculate the correct datetype String
        let typeString = "datetime-local"
        if (!boneState.bonestructure["time"]) {
          typeString = "date"
        }

        if (!boneState.bonestructure["date"]) {
          typeString = "time"
        }
        return typeString
      })
    })

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
</style>
