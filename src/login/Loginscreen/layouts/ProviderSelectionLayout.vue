<template>
    <div class="wrapper loginform" v-if="Object.keys(formState.structure).length>0">
      <template
        v-for="(boneValue,boneName) in formState.skel"
        :key="boneName"
      >
        <template v-if="formState.structure?.[boneName]">
          <slot :boneName="boneName"
                :showBoneTooltip="false"
                :widget="ProviderSelectionBone"
          >
          </slot>
        </template>

      </template>
    </div>
  </template>

  <script setup>
  import {inject} from 'vue'
  import {getBoneWidget} from "../../../bones/edit";
  import ProviderSelectionBone from "../bones/ProviderSelectionBone.vue";

  const formState = inject("formState")
  const formUpdate = inject("formUpdate")

  </script>

  <style scoped>
    :deep(.bone-wrapper){
        margin:0;
    }
  </style>
