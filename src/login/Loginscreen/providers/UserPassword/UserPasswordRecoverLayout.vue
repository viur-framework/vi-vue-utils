<template>
  <div v-if="Object.keys(formState.structure).length > 0" class="wrapper">
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

const formState = inject("formState")
const formUpdate = inject("formUpdate")
function getWidget(boneStructure) {
  return getBoneWidget(boneStructure["type"])
}
</script>

<style scoped>
:deep(.bone-wrapper) {
  margin: 0;
}
</style>
