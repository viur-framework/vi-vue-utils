<template>
  <div class="actionbar">
      <sl-button variant="success" v-if="boneState.multiple && !readonly" @click="handleAdd(lang)">
        {{$t("bone.add")}} <template v-if="state.counter>1">({{ state.counter }})</template>
      </sl-button>
      <sl-button variant="danger" v-if="boneState.multiple && !readonly" @click="removeMultipleEntries(null)">
        {{$t("bone.delete")}}
      </sl-button>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, inject} from 'vue'

export default defineComponent({
  props:{
      name:String,
      value:Object,
      index:Number,
      lang:String,
      readonly:Boolean,
      params:Object,
  },
  components: {},
  emits:["change"],
  setup(props, context) {

      const boneState = inject("boneState")
      const state = reactive({
        counter:0,
        debounce:null
      })
      const addMultipleEntry = inject("addMultipleEntry")
      const removeMultipleEntries = null

      function handleAdd(){
        state.counter+=1
        let delay=200;
        if (state.counter>1){
          delay=500
        }
        if (state.debounce){
          clearTimeout(state.debounce)
        }
        state.debounce = setTimeout(()=>{
          for(let i=state.counter; i--;){
            addMultipleEntry(props.lang)
          }
          state.counter=0;
        },delay)
      }

      return {
          state,
          boneState,
          handleAdd,
          removeMultipleEntries
      }
  }
})
</script>

<style scoped>
</style>
