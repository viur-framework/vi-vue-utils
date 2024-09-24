<template>
  {{ getBoneValue(boneName, state.option) }}
</template>

<script lang="ts">
//@ts-nocheck
import boneLogic from "./boneLogic"
import {computed, defineComponent, reactive} from "vue"

export default defineComponent({
  props: {
    boneName: String,
    skel: Object,
    structure: Object
  },
  setup(props, context) {
    const state = reactive({
      option: computed(()=>{
        if (props.structure[props.boneName]["type"] === "date"){
          if( props.structure[props.boneName]["date"] && !props.structure[props.boneName]["time"]){
            return "date"
          }

          if( props.structure[props.boneName]["time"] && !props.structure[props.boneName]["date"]){
            return "time"
          }
        }
        return null
      })
    })

    const { getBoneValue, bones_state } = boneLogic(props.skel, props.structure)
    return { getBoneValue,state }
  }
})
</script>

<style scoped></style>
