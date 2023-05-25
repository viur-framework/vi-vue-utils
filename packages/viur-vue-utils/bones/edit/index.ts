//@ts-nocheck
import rawBone from './default/rawBone.vue';
import keyBone from './default/keyBone.vue';
import stringBone from './default/stringBone.vue';
import emailBone from './default/emailBone.vue';
import dateBone from './default/dateBone.vue';
import selectBone from './default/selectBone.vue';
import booleanBone from './default/booleanBone.vue';
import passwordBone from './default/passwordBone.vue';
import recordBone from './default/recordBone.vue';
import colorBone from './default/colorBone.vue';
import numericBone from './default/numericBone.vue';
import relationalBone from './default/relationalBone.vue';
import jsonBone from './default/jsonBone.vue';
import fileBone from './default/fileBone.vue';

import {reactive} from "vue";
import {defineStore} from "pinia";

export const useBoneStore = defineStore("boneStore", () => {
  const state = reactive({
    bones:{}
  })

  function addBoneWidget(boneType,widget){
    state.bones[boneType]=widget
  }

  function getBoneWidget(boneType){
    if (Object.keys(state.bones).includes(boneType)){
      return state.bones[boneType]
    }

    if(boneType==="date"){
      return dateBone
    }else if (boneType==="key"){
      return keyBone
    }else if (boneType==="str.email"){
      return emailBone
    }else if (boneType==="str" || boneType.startsWith("str.")){
      return stringBone
    }else if (boneType==="select" || boneType.startsWith("select.")){
      return selectBone
    }else if (boneType==="bool"){
      return booleanBone
    }else if (boneType==="password"){
      return passwordBone
    }else if (boneType==="record"){
      return recordBone
    }else if (boneType==="numeric" || boneType.startsWith("numeric.")){
      return numericBone
    }else if(boneType==="relational.tree.leaf.file.file"){
      return fileBone
    }else if (boneType==="relational" || boneType.startsWith("relational.")){
      return relationalBone
    }else if(boneType==="raw.json"){
      return jsonBone
    }else if(boneType==="color"){
      return colorBone
    }

    return rawBone
  }


  return {
    state,
    addBoneWidget,
    getBoneWidget
  }
})

export function getBoneWidget(boneType){
  const boneStore = useBoneStore()
  return boneStore.getBoneWidget(boneType)
}

export function addBoneWidget(boneType,widget){
  const boneStore = useBoneStore()
  boneStore.addBoneWidget(boneType,widget)
}

export function BoneHasMultipleHandling(boneType){
  if(boneType==="select" || boneType.startsWith("select.")){
    return true
  }
  return false
}

export default {
  rawBone,
  keyBone,
  stringBone,
  emailBone,
  dateBone,
  booleanBone,
  selectBone,
  passwordBone,
  recordBone,
  numericBone,
  colorBone,
  relationalBone,
  jsonBone,
  fileBone
}
