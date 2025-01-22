<template>
  {{ getBoneValue(boneName, state.option) }}
</template>

<script setup>
import boneLogic from "./boneLogic"
import {computed, defineComponent, reactive} from "vue"

   const props = defineProps({
    boneName: String,
    skel: Object,
    structure: Object
  })

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
</script>

<style scoped></style>
