<template>
    <div class="wrapper loginform" v-if="Object.keys(formState.structure).length>0">
      <template
        v-for="(boneValue,boneName) in formState.skel"
        :key="boneName"
      >
        <template v-if="formState.structure?.[boneName]">
          <slot :boneName="boneName"
                :showBoneTooltip="false"
                :widget="getWidget(formState.structure[boneName])"
          >
          </slot>
        </template>
  
      </template>
    </div>
  </template>
  
  <script setup>
  import {inject} from 'vue'
  import {getBoneWidget} from "../../bones/edit";
  import LoginPasswordBone from '../bones/LoginPasswordBone.vue';
  import LoginUsernameBone from '../bones/LoginUsernameBone.vue';


  const formState = inject("formState")
  const formUpdate = inject("formUpdate")
  function getWidget(boneStructure){
    if (boneStructure['type'] === 'str.email'){
        return LoginUsernameBone
    }else if (boneStructure['type'] === 'password'){
        return LoginPasswordBone
    }else{
        return getBoneWidget(boneStructure['type'])
    }
  }



  </script>
  
  <style scoped>
    :deep(.bone-wrapper){
        margin:0;
    }
  </style>
  