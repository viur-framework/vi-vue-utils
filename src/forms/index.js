import rawBone from "./bones/rawBone.vue"
import keyBone from "./bones/keyBone.vue"
import stringBone from "./bones/stringBone.vue"
import emailBone from "./bones/emailBone.vue"
import dateBone from "./bones/dateBone.vue"
import selectBone from "./bones/selectBone.vue"
import booleanBone from "./bones/booleanBone.vue"
import passwordBone from "./bones/passwordBone.vue"
import recordBone from "./bones/recordBone.vue"
import colorBone from "./bones/colorBone.vue"
import numericBone from "./bones/numericBone.vue"
import relationalBone from "./bones/relationalBone.vue"
import jsonBone from "./bones/jsonBone.vue"
import fileBone from "./bones/fileBone.vue"
import textBone from "./bones/textBone.vue"
import spatialBone from "./bones/spatialBone.vue"

import defaultBar from "./bones/bars/defaultBar.vue"
import relationalBar from "./bones/bars/relationalBar.vue"
import fileBar from "./bones/bars/fileBar.vue"

import { reactive,shallowRef } from "vue"
import { defineStore } from "pinia"

export const useBoneStore = defineStore("boneStore", () => {
  const state = reactive({
    additionalBones: shallowRef({}),
    defaultBones: shallowRef({
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
      fileBone,
      textBone,
      spatialBone
    }),
    actionbars: shallowRef({
      "relational.tree.leaf.file.file": fileBar,
      "relational.": relationalBar
    }),
    multibones: shallowRef(["select", "select."])
  })

  function addBoneWidget(boneType, widget) {
    state.additionalBones[boneType] = widget
  }

  function importWidgets() {
    let bones = state.defaultBones
    for (const [k, v] of Object.entries(state.additionalBones)) {
      bones.add(v)
    }
    return bones
  }

  function getBoneWidget(boneType) {
    if (Object.keys(state.additionalBones).includes(boneType)) {
      //exact match
      return state.additionalBones[boneType]
    } else {
      let typeParts = boneType.split(".") //prefix match
      let matchingPrefixes = Object.entries(state.additionalBones).filter((prefix) =>
        prefix[0].startsWith(typeParts[0] + ".")
      )
      if (matchingPrefixes.length > 0) {
        matchingPrefixes.sort((a, b) => b.length - a.length)
        for (let prefix of matchingPrefixes) {
          if (boneType.startsWith(prefix[0])) {
            return state.additionalBones[prefix[0]]
          }
        }
      }
    }

    if (boneType === "date") {
      return dateBone
    } else if (boneType === "key") {
      return keyBone
    } else if (boneType === "str.email") {
      return emailBone
    } else if (boneType === "str" || boneType.startsWith("str.")) {
      return stringBone
    } else if (boneType === "select" || boneType.startsWith("select.")) {
      return selectBone
    } else if (boneType === "bool") {
      return booleanBone
    } else if (boneType === "password") {
      return passwordBone
    } else if (boneType === "record") {
      return recordBone
    } else if (boneType === "numeric" || boneType.startsWith("numeric.")) {
      return numericBone
    } else if (boneType === "relational.tree.leaf.file.file") {
      return fileBone
    } else if (boneType === "relational" || boneType.startsWith("relational.")) {
      return relationalBone
      /*} else if (boneType === "raw.json") {
      return jsonBone*/
    } else if (boneType === "color") {
      return colorBone
    } else if (boneType === "text") {
      return textBone
    } else if (boneType === "spatial") {
      return spatialBone
    }

    return rawBone
  }

  function addBoneActionbar(boneType, widget) {
    state.actionbars[boneType] = widget
  }

  function getBoneActionbar(boneType) {
    if (Object.keys(state.actionbars).includes(boneType)) {
      //exact match
      return state.actionbars[boneType]
    } else {
      let typeParts = boneType.split(".") //prefix match
      let matchingPrefixes = Object.entries(state.actionbars).filter((prefix) =>
        prefix[0].startsWith(typeParts[0] + ".")
      )
      if (matchingPrefixes.length > 0) {
        matchingPrefixes.sort((a, b) => b.length - a.length)
        for (let prefix of matchingPrefixes) {
          if (boneType.startsWith(prefix[0])) {
            return state.actionbars[prefix[0]]
          }
        }
      }
    }

    return defaultBar
  }

  return {
    state,
    addBoneWidget,
    getBoneWidget,
    importWidgets,

    addBoneActionbar,
    getBoneActionbar
  }
})

export function addBoneActionbar(boneType, widget) {
  const boneStore = useBoneStore()
  return boneStore.addBoneActionbar(boneType, widget)
}

export function getBoneActionbar(boneType) {
  const boneStore = useBoneStore()
  return boneStore.getBoneActionbar(boneType)
}

export function getBoneWidget(boneType) {
  const boneStore = useBoneStore()
  return boneStore.getBoneWidget(boneType)
}

export function addBoneWidget(boneType, widget) {
  const boneStore = useBoneStore()
  boneStore.addBoneWidget(boneType, widget)
}

export function BoneHasMultipleHandling(boneType) {
  const boneStore = useBoneStore()
  if (boneStore.state.multibones.includes(boneType)){
    return true
  } else {
    let typeParts = boneType.split(".") //prefix match
    let matchingPrefixes = Object.entries(boneStore.state.multibones).filter((prefix) =>
      prefix[1].startsWith(typeParts[0] + ".")
    )
    if (matchingPrefixes.length > 0) {
      matchingPrefixes.sort((a, b) => b.length - a.length)
      for (let prefix of matchingPrefixes) {
        if (boneType.startsWith(prefix[1])) {
          return true
        }
      }
    }
  }
  return false
}
