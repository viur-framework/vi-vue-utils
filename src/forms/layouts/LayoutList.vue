<template>
  <div class="wrapper" v-if="Object.keys(formState.structure).length>0">
    <template
      v-for="(boneValue,boneName) in formState.skel"
      :key="boneName"
    >
      <template v-if="formState.structure?.[boneName]">
        <slot :boneName="boneName"
              :widget="getBoneWidget(formState.structure[boneName]['type'])"
        >
        </slot>
      </template>

    </template>
  </div>
</template>

<script setup>
import {inject} from 'vue'
import {getBoneWidget} from "../index";
const formState = inject("formState")
const formUpdate = inject("formUpdate")
</script>

<style scoped>
.wrapper{
  padding:20px;
}
</style>
