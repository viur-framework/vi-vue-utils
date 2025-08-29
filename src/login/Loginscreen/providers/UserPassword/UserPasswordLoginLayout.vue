<template>
  <div v-if="Object.keys(formState.structure).length > 0" class="wrapper loginform">
    <template v-for="(boneValue, boneName) in formState.skel" :key="boneName">
      <template v-if="formState.structure?.[boneName]">
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
import LoginPasswordBone from "./LoginPasswordBone.vue"
import LoginUsernameBone from "./LoginUsernameBone.vue"

const formState = inject("formState")
const formUpdate = inject("formUpdate")
function getWidget(boneStructure) {
  if (boneStructure["type"] === "str.email") {
    return LoginUsernameBone
  } else if (boneStructure["type"] === "password") {
    return LoginPasswordBone
  } else {
    return getBoneWidget(boneStructure["type"])
  }
}
</script>

<style scoped>
:deep(.bone-wrapper) {
  margin: 0;
}
</style>
