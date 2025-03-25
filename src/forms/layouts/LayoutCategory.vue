<template>
  <template v-for="(category,identifier) in formState.categories">

    <vi-form-category :name="category['name']"
                      :identifier="identifier"
                      :visible="!!category['visible']"
                      :open="category['open']"
                      :hide="!formState.useCategories"

    >
      <template
        v-for="bone in category['bones']"
        :key="bone['name']"
      >
        <slot :boneName="bone['name']"
              :widget="getBoneWidget(formState.structure[bone['name']]['type'])"
        >
        </slot>

      </template>
    </vi-form-category>
  </template>
</template>

<script setup>
import {inject} from 'vue'
import {getBoneWidget} from "../index";
import ViFormCategory from "../ViFormCategory.vue";
const formState = inject("formState")
const formUpdate = inject("formUpdate")
</script>

<style scoped>

</style>
