<template>
    <slot :structure="state.structure"
          :skel="state.skel"
          :errors="state.errors"
          :categories="state.categories"
    >
      <component :is="layout" v-slot="{boneName, widget, visible, label}">

          <bone v-if="widget!==undefined"
                :is="widget"
                v-show="visible===undefined?state.structure[boneName]['visible']:visible"
                :name="boneName"
                :structure="state.structure"
                :skel="state.skel"
                :errors="state.errors"
                :default-language="defaultLanguage"
                :label="label===undefined?state.label:label"
                @change-internal="formUpdate"
              >
              </bone>
      </component>
    </slot>
</template>

<script setup>
import Loader from "../generic/Loader.vue"
import Request from "../utils/request"
import { useFormUtils } from "./utils"
import { getBoneWidget } from "../bones/edit/index"
import { reactive, watch, onBeforeMount, computed, unref, provide } from "vue"
import { useDebounceFn } from '@vueuse/core'
import LayoutCategory from "./layouts/LayoutCategory.vue"

const emit = defineEmits(["change"])
const props = defineProps({
  //modulename
  module: {
    type: String
  },
  //like add, edit, clone ...
  action: null,
  // groupedlists subtype
  group: null,
  // edit or clone need a existing skelkey
  skelkey: null,
  // trees need a skeltype like leaf or node
  skeltype: null,
  // use skey or not
  secure: {
    type: Boolean,
    default: true
  },
  //the above fields are needed for normal form.

  //if skel and structure defined this will be used instead of fetchData
  skel:{
    type:[Object,null,String],
    default:null
  },
  structure:{
    type: [Object, Array],
    default:null
  },

  // show only these bones
  bones: {
    type: Array,
    default: []
  },
  //override server defaultvalues
  values: {
    type: Object,
    default: null
  },
  //used for fetch data
  params:{
    type: Object,
    default:{}
  },
  // define the renderer default is json
  renderer: {
    type: String,
    default: import.meta.env.VITE_DEFAULT_RENDERER || "json"
  },
  useCategories:{
    type: Boolean,
    default:true
  },
  collapsedCategories:{
    type: Array,
    default:[]
  },
  sendReadOnly: {
    type:Boolean,
    default:false
  },
  internal:{
    type:[Object,null],
    default:null
  },
  layout:{
    type:Object,
    default:LayoutCategory
  },
  label:{
    type:String,
    default:"normal",
    validator(value,props){
      return ["normal","top","hide","placeholder"].includes(value)
    }
  },
  defaultLanguage:{
    type:String,
    default:"de"
  },
  fetchUrl:{
    type:[String,null],
    default:null
  }
  // add errors, from the outside (maybe relevant if form is build with slots)
  // errors: []
})

const state = reactive({
  skel: {}, // working data
  structure: {}, // working data, use dict!
  errors: [], // working data
  loading:false, //loading state
  categories:[], //categories to render
  values:computed(()=>props.values),
  internal:computed(()=>props.internal),
  useCategories:computed(()=>props.useCategories),
  label:computed(()=>props.label),
  bones:computed(()=>props.bones)
})
provide("formState", state)
if (!props.internal){
  provide("mainformState", state)
}


const {fetchData, sendData, updateSkel, initForm,logics} = useFormUtils(props,state)

const formUpdateEvent = useDebounceFn((data)=>{
  emit("change", data)
},500)

onBeforeMount(()=>{
  state.loading=true
  if (props.structure){
    initForm(props.skel,props.structure, state.values)
    state.loading=false
  }else if(props.module && props.action){
    fetchData(props.fetchUrl,props.params).then(async(resp)=>{state.loading=false}).catch(async(error)=>{state.loading=false})
  }else{
    console.log(props)
    console.error("Error while building Form: you need atleast module and action or structure parameters")
  }
})

watch(()=>props.skel,(oldVal,newVal)=>{
  //dragging internalforms
  // structure wont be updated, cause of logic changes on structures
  initForm(props.skel,undefined,state.value)
  //rerun logics after dragging
  logics()
})
watch(()=>props.structure,(oldVal,newVal)=>{
  //rerun logics if structure on mainform changes
  logics()
},{ deep: true })

function formUpdate(data){
  updateSkel(data)
  formUpdateEvent(data)
}
provide("formUpdate",formUpdate)


defineExpose({sendData,fetchData,updateSkel,state})
</script>

<style scoped>

</style>
