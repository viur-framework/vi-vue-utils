<template>
      <ckeditor :editor="DecoupledEditor"
        :config="state.editorConfig"
        :disabled="!state.ready"
        @input="changeEvent"
        @ready="onReady">
      </ckeditor>
      {{ state.ready  }}
</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, inject} from 'vue'
import DecoupledEditor from "@ckeditor/ckeditor5-build-decoupled-document";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

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
          ready:false,
          value:props.value,
          editorConfig:{
            plugins:[SourceEditing],
            toolbar: [
            'heading','bold', 'italic', 'underline', '|',
            'alignment','numberedList','bulletedList','blockQuote', '|',
            'outdent', 'indent',  '|',
            'link','insertTable',
            'undo', 'redo'

         ]}
        })

        function changeEvent(event){
            context.emit("change",props.name,state.value,props.lang,props.index)
        }

        onMounted(()=>{
            state.value =props.value
            context.emit("change",props.name,props.value,props.lang,props.index) //init
        })

        function onReady(editor){
          console.log("SSS")
          editor.ui.getEditableElement().parentElement.insertBefore(
              editor.ui.view.toolbar.element,
              editor.ui.getEditableElement()
          );
          state.ready = true
        }


        return {
            state,
            DecoupledEditor,
          boneState,
            changeEvent,
            onReady
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
