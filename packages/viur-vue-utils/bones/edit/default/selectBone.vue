<template>
    <sl-select :disabled="boneState.readonly"
               :value="value"
               @sl-change="changeEvent"
               :multiple="boneState['bonestructure']['multiple']"
               clearable>
      <sl-option :value="value[0]" v-for="value in boneState['bonestructure']['values']">
          {{ value[1] }}
      </sl-option>
    </sl-select>
</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, inject} from 'vue'

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
        const state = reactive({})

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
    sl-select{
        width:100%;

      &::part(combobox){
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
</style>
