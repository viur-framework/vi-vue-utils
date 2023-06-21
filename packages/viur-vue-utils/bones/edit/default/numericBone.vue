<template>
    <sl-input type="number"
      :disabled="boneState.readonly"
      :value="value"
      :min="state.minAmount"
      :max="state.maxAmount"
      :step="state.precision"
      @sl-change="changeEvent"
    >

    </sl-input>


</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, computed, inject} from 'vue'

export default defineComponent({
    props:{
        name:String,
        value:Object,
        index:Number,
        lang:String
    },
    components: {},
    emits:["change"],
    setup(props, context) {
        const boneState = inject("boneState")
        const state = reactive({
          minAmount:computed(()=>{return boneState.bonestructure["minAmount"]}),
          maxAmount:computed(()=>{return boneState.bonestructure["maxAmount"]}),
          precision:computed(()=>{
            if (boneState.bonestructure["precision"]>1){
              return parseFloat(`0.${"0".repeat(boneState.bonestructure["precision"] - 1)}1`);
            }
            return undefined
          }),
        })

        function changeEvent(event){
            context.emit("change",props.name,event.target.value,props.lang,props.index)
        }

        onMounted(()=>{
            context.emit("change",props.name,props.value,props.lang,props.index) //init
        })

        return {
            state,
            boneState,
            changeEvent
        }
    }
})
</script>

<style scoped lang="less">
    sl-input{
      width:100%;

      &::part(base){
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      @media (max-width: 900px){
        &::part(base){
          border-top-right-radius: 0;
          border-bottom-left-radius: var(--sl-border-radius-medium);
        }
      }
    }
</style>