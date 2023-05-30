<template>
    <div class="record">
      <sl-input v-if="boneState.bonestructure['multiple']" :disabled="boneState.readonly" :value="formatString(state.format,value)"></sl-input>
      <sl-combobox :disabled="boneState.readonly" :source="getList" hoist v-else
      @sl-item-select="changeEvent"></sl-combobox>
      <Wrapper_nested
        :value="value"
        :name="name"
        :index="index"
      >

      </Wrapper_nested>
    </div>
</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, inject, computed} from 'vue'
import { Request } from "../../../index"
import Wrapper_nested from '../wrapper_nested.vue'

export default defineComponent({
    props:{
        name:String,
        value:Object,
        index:Number,
        lang:String
    },
    components: {Wrapper_nested},
    emits:["change"],
    setup(props, context) {
        const boneState = inject("boneState")
        const formatString = inject("formatString")
        const state = reactive({
          format:computed(()=>{
            return boneState?.bonestructure['format']
          }),
        })


        function getList(search:String){
          let params =""
          if(boneState.bonestructure["type"]==="relational.tree.leaf.file"){
            params = "skelType=leaf&"
          }else if (boneState.bonestructure["type"]==="relational.tree.node.file"){
            params = "skelType=node&"
          }

          return Request.get(`/json/${boneState.bonestructure["module"]}/list?${params}limit=99`).then(async(resp)=>{ //?viurTags$lk=${search.toLowerCase()
            const data = await resp.json()
            return data["skellist"]?.map((d:any)=>{
              return {text: formatString(boneState.bonestructure["format"], {dest:d}),
                    value:d.key,
                    data:d
            }
            })
          })
        }

        function changeEvent(event){
            context.emit("change",props.name,event.detail.item.value,props.lang,props.index)
        }

        onMounted(()=>{
            context.emit("change",props.name,props.value,props.lang,props.index) //init
        })

        return {
            state,
            boneState,
            formatString,
            changeEvent,
          getList
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

    &::part(base){
      background-color: var(--sl-color-neutral-0);
    }
  }
  sl-combobox{
    width: 100%;

    &::part(input){
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;

      :deep(&::part(base)){
        border: 1px solid red;
      }
    }
  }
</style>
