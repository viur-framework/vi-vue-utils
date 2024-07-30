<template>
  <template v-for="(category,identifier) in state.categories">
    <vi-form-category :name="category['name']"
                      :identifier="identifier"
                      :visible="category['visible']"
                      :open="category['open']"
                      :hide="!useCategories"

    >
      <template
        v-for="bone in category['bones']"
        :key="bone['name']"
      >
      <bone
              :is="getBoneWidget(state.structure[bone['name']]['type'])"
              v-show="state.structure[bone['name']]['visible']"
              :name="bone['name']"
              :structure="state.structure"
              :skel="state.skel"
              :errors="state.errors"
              @change-internal="updateSkel"
            >
            </bone>
      </template>
    </vi-form-category>

  </template>
</template>

<script setup>
import bone from "../bones/edit/bone.vue"
import Loader from "../generic/Loader.vue"
import Request from "../utils/request"
import { useFormUtils } from "./utils"
import { getBoneWidget } from "../bones/edit/index"
import { reactive, watch, onBeforeMount } from "vue"
import ViFormCategory from "./ViFormCategory.vue"

defineEmits(["change"])
const props = defineProps({
  //modulename
  module: {
    type: String,
    required: true
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
})

const {fetchData, sendData, updateSkel} = useFormUtils(props,state)

onBeforeMount(()=>{
  fetchData()
})

defineExpose({sendData,fetchData,updateSkel})
</script>

<style scoped>

</style>
