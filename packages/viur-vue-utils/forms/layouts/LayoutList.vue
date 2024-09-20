<template>
  <div class="wrapper" v-id="Object.keys(formState.structure).length>0">
    <template
      v-for="(boneValue,boneName) in formState.skel"
      :key="boneName"
    >
      <template v-if="formState.bones?.includes(boneName)">
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
import {getBoneWidget} from "../../bones/edit";
const formState = inject("formState")
const formUpdate = inject("formUpdate")
</script>

<style scoped>
.wrapper{
  padding:20px;
}
</style>
