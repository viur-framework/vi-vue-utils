<template>
  <div class="wrapper" v-id="Object.keys(formState.structure).length>0">
    <div class="column left" >
      <template
        v-for="(boneValue,boneName,idx) in formState.skel"
        :key="boneName"
      >
        <slot :boneName="boneName"
                v-if="idx%2 ===0"
                :widget="getBoneWidget(formState.structure[boneName]['type'])"
                :visible="formState.structure[boneName]['visible']"
          >
            <bone
                :is="getBoneWidget(formState.structure[boneName]['type'])"
                v-show="formState.structure[boneName]['visible']"
                :name="boneName"
                :structure="formState.structure"
                :skel="formState.skel"
                :errors="formState.errors"
                @change-internal="formUpdate"
              >
              </bone>
          </slot>
      </template>
    </div>
    <div class="column right" >
      <template
        v-for="(boneValue,boneName,idx) in formState.skel"
        :key="boneName"
      >
        <slot :boneName="boneName"
                v-if="idx%2!==0"
                :widget="getBoneWidget(formState.structure[boneName]['type'])"
                :visible="formState.structure[boneName]['visible']"
          >
            <bone
                :is="getBoneWidget(formState.structure[boneName]['type'])"
                v-show="formState.structure[boneName]['visible']"
                :name="boneName"
                :structure="formState.structure"
                :skel="formState.skel"
                :errors="formState.errors"
                @change-internal="formUpdate"
              >
              </bone>
          </slot>
      </template>
    </div>
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
  display:flex;
  gap:20px;
  width: 100%;

  .column{
    display:flex;
    flex-direction:column;
    width: 100%;
  }

}
</style>