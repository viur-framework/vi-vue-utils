<template>
      <ckeditor v-if="boneState.bonestructure['validHtml']"
        :editor="ClassicEditor"
        :config="state.editorConfig"
        v-model="state.value"
        @ready="onReady"
        @input="changeEvent">
      </ckeditor>
      <sl-textarea v-else @input="changeEventTextarea" :disabled="boneState.readonly" :value="value"></sl-textarea>
</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, inject} from 'vue'
import "../../../ckeditor/ckeditor.js";

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
          value:props.value,
          editorConfig:{}
        })

        function changeEvent(event){
            context.emit("change",props.name,state.value,props.lang,props.index)
        }
        function changeEventTextarea(event){
            state.value = event.target.value
            context.emit("change",props.name,state.value,props.lang,props.index)
        }

        onMounted(()=>{
            state.value = props.value
            context.emit("change",props.name,props.value,props.lang,props.index) //init
        })

        function onReady(editor){
          if(boneState.readonly){
            console.log("GGGG")
            editor.isReadOnly = true
          }
        }


        return {
            state,
            ClassicEditor,
            boneState,
            changeEvent,
            onReady,
          changeEventTextarea
        }
    }
})
</script>

<style scoped lang="less">
    .ck-editor{
      width:100%;

      :deep(.ck-content){
        width:100%;
        height: 300px;
      }
    }
</style>
