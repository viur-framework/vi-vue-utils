<template>
  <form :ref="(el)=>state.viformelement=el" @submit.prevent.stop="()=>{}">
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
                :boneactions="state.boneactions"
                :default-language="defaultLanguage"
                :label="label===undefined?state.label:label"
                @change-internal="formUpdate"
                :errorStyle="errorStyle"
              >
              </bone>
      </component>
    </slot>
  </form>
</template>

<script setup>
import Loader from "../generic/Loader.vue"
import Request from "../utils/request"
import { useFormUtils } from "./utils"
import { getBoneWidget } from "../bones/edit/index"
import { reactive, watch, onBeforeMount, computed, unref, provide, ref } from "vue"
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
  boneactions:{
    type:Boolean,
    default:false
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
  },
  errorStyle:{
      type:String,
      default:"default",
      validator(value,props){
        return ["default","decent"].includes(value)
      }
    }
  // add errors, from the outside (maybe relevant if form is build with slots)
  // errors: []
})

const state = reactive({
  skel: {}, // working data
  structure: {}, // working data, use dict!
  errors: [], // working data
  actionparams: {}, //actionskel parameters
  actionname:null, //lastaction name
  valids:{}, // local validation states
  loading:false, //loading state
  categories:[], //categories to render
  values:computed(()=>props.values),
  internal:computed(()=>props.internal),
  useCategories:computed(()=>props.useCategories),
  label:computed(()=>props.label),
  bones:computed(()=>props.bones),
  boneactions:computed(()=>props.boneactions),
  isValid:computed(()=>{ // is form valid?
    let validstate = true
    for(const [key,value] of Object.entries(state.valids)){
      if (!value){
        validstate = false
        break
      }
    }
    return validstate
  }),
  viformelement: ref(null)
})
provide("formState", state)
if (!props.internal){
  provide("mainformState", state)
}

const {fetchData, sendData, updateSkel, initForm, logics, reload} = useFormUtils(props,state)

const formUpdateEvent = useDebounceFn((data)=>{
  emit("change", data)
},500)

onBeforeMount(()=>{
  reload()
})

watch(()=>props.skel,(oldVal,newVal)=>{
  //dragging internalforms
  // structure wont be updated, cause of logic changes on structures
  initForm(props.skel,undefined,state.value)
  //rerun logics after dragging
  logics()
},{ deep: true })
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
