<template>
  <div class="actionbar">
     <sl-button variant="danger"
                 v-if="boneState.multiple && !readonly"
                 @click="openSelector()"
                :title='$t("bone.del")'
                 outline
                 class="delete-btn">
         <sl-icon name="x"></sl-icon>
      </sl-button>

      <sl-combobox :source="getList" hoist
      @sl-item-select="addMultipleEntry(lang, {'dest':state.skels?.[$event.detail.item.value],'rel':null})"></sl-combobox>

      <sl-button variant="success"
                 v-if="boneState.multiple && !readonly"
                 @click="addMultipleEntry(lang)"
                  :title='$t("bone.add")'
                 outline
                 class="add-btn">
        <sl-icon name="plus"></sl-icon> {{$t("bone.list")}}
      </sl-button>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, inject} from 'vue'
import { Request } from "../../../index"

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
      const addMultipleEntry = inject("addMultipleEntry")
      const formatString = inject("formatString")
      const removeMultipleEntries = null
      const state = reactive({
        skels:{}
      })

      function getList(search:String){
        let params = ""
        if(boneState.bonestructure["type"]==="relational.tree.leaf.file"){
          params = "skelType=leaf&"
        }else if (boneState.bonestructure["type"]==="relational.tree.node.file"){
          params = "skelType=node&"
        }
        return Request.get(`/json/${boneState.bonestructure["module"]}/list?${params}limit=99`).then(async(resp)=>{ //?viurTags$lk=${search.toLowerCase()}
          const data = await resp.json()
          state.skels = data["skellist"].reduce((acc,curr)=> (acc[curr["key"]]=curr,acc),{});

          return data["skellist"]?.map((d:any)=>{
            return {text: formatString(boneState.bonestructure["format"], {dest:d}),
                  value:d.key,
                  data:d
          }
          })
        })
      }

      function openSelector(){

      }


      return {
          state,
          boneState,
          addMultipleEntry,
          removeMultipleEntries,
          getList
      }
  }
})
</script>

<style scoped lang="less">
.actionbar{
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

sl-combobox{
  width:100%
}

.delete-btn{
  margin-right: var(--sl-spacing-x-small);

  &::part(base){
    aspect-ratio: 1;
  }
}

.add-btn{
  margin-left: var(--sl-spacing-x-small);

  sl-icon{
    margin-right: var(--sl-spacing-x-small);
  }
}


</style>