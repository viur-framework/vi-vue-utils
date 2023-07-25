<template>
    <sl-select :disabled="boneState.readonly"
               :value="state.value"
               @sl-change="changeEvent"
               :multiple="boneState['bonestructure']['multiple']"
               max-options-visible="0"
               >
      <sl-option :value="value[0]" v-for="value in boneState['bonestructure']['values']">
          {{ value[1] }}
      </sl-option>
    </sl-select>
</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, inject, computed} from 'vue'

export default defineComponent({
    props:{
        name:String,
        value:null,
        index:Number,
        lang:String
    },
    components: {},
    emits:["change"],
    setup(props, context) {
      const boneState = inject("boneState")
        const state = reactive({
          value:computed(()=>{
            let val = props.value
            if (Array.isArray(props.value)){
              val = val.filter(i=>boneState['bonestructure']['values'].map(i=>i[0]).includes(i))
              return val.map(i=>i.toString())
            }
            return props.value?props.value.toString():''
          })
        })

        function changeEvent(event){
            context.emit("change",props.name,event.target.value,props.lang,props.index)
        }

        onMounted(()=>{
            context.emit("change",props.name,state.value,props.lang,props.index) //init
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
    sl-select{
        width:100%;

      &::part(combobox){
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }

      @media (max-width: 900px){
        &::part(combobox){
          border-top-right-radius: 0;
          border-bottom-left-radius: var(--sl-border-radius-medium);
        }
      }
    }

    sl-option{
      &::part(base){
        transition: background-color ease .3s;
      }

      &:hover{
        &::part(base){
          background-color: var(--sl-color-gray-200);
        }
      }
    }
</style>
