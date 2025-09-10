<template>
  <div v-if="Object.keys(formState.structure).length > 0" class="wrapper">
    <template v-for="(boneValue, boneName) in formState.skel" :key="boneName">
      <template v-if="formState.structure?.[boneName] && ensureValidBones(formState.structure[boneName]['type'])">
        <slot
          :bone-name="boneName"
          :show-bone-tooltip="false"
          :widget="getWidget(formState.structure[boneName])"
        ></slot>
      </template>
    </template>
  </div>
</template>

<script setup>
import { inject } from "vue"
import { getBoneWidget } from "../../../../bones/edit"
import LoginPasswordBone from "../UserPassword/LoginPasswordBone.vue"

const formState = inject("formState")
const formUpdate = inject("formUpdate")
function getWidget(boneStructure) {
  if (boneStructure["type"] === "password" && !boneStructure["tests"].length) {
    return LoginPasswordBone
  }
  return getBoneWidget(boneStructure["type"])
}

function ensureValidBones(type) {
  if (type.startsWith("relational.")) {
    return false
  }
  return true
}
</script>

<style scoped>
:deep(.bone-wrapper) {
  margin: 0;
}
</style>
