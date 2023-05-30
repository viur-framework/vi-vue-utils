<template>
    <ckeditor :editor="state.editor" v-model="state.value" :config="state.editorConfig" @input="changeEvent"></ckeditor>
</template>

<script lang="ts">
//@ts-nocheck
import {reactive, defineComponent, onMounted, inject} from 'vue'
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
          editor:ClassicEditor,
          value:props.value,
          editorConfig:{} //toolbar: [ 'bold', 'italic', '|', 'link' ]
        })

        function changeEvent(event){
            context.emit("change",props.name,state.value,props.lang,props.index)
        }

        onMounted(()=>{
            state.value =props.value
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
    .ck-editor{
      width:100%;

      :deep(.ck-content){
        width:100%;
        height: 300px;
      }
    }
</style>
