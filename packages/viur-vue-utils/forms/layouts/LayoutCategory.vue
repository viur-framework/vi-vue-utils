<template>
  <template v-for="(category,identifier) in formState.categories">
    <vi-form-category :name="category['name']"
                      :identifier="identifier"
                      :visible="category['visible']"
                      :open="category['open']"
                      :hide="!formState.useCategories"

    >
      <template
        v-for="bone in category['bones']"
        :key="bone['name']"
      >
        <slot :boneName="bone['name']"
              :widget="getBoneWidget(formState.structure[bone['name']]['type'])"
              :visible="formState.structure[bone['name']]['visible']"
        >
          <bone
              :is="getBoneWidget(formState.structure[bone['name']]['type'])"
              v-show="formState.structure[bone['name']]['visible']"
              :name="bone['name']"
              :structure="formState.structure"
              :skel="formState.skel"
              :errors="formState.errors"
              @change-internal="formUpdate"
            >
            </bone>
        </slot>

      </template>
    </vi-form-category>
  </template>
</template>

<script setup>
import {inject} from 'vue'
import {getBoneWidget} from "../../bones/edit";
import ViFormCategory from "../ViFormCategory.vue";
const formState = inject("formState")
const formUpdate = inject("formUpdate")
</script>

<style scoped>

</style>