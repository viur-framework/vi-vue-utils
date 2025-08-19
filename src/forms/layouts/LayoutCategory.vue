<template>
  <template v-for="(category, identifier) in formState.categories">
    <vi-form-category
      v-if="hasCategoryBones(category)"
      :name="category['name']"
      :identifier="identifier"
      :visible="!!category['visible']"
      :open="category['open']"
      :hide="!formState.useCategories"
    >
      <template v-for="bone in category['bones']" :key="bone['name']">
        <slot :bone-name="bone['name']" :widget="getBoneWidget(formState.structure[bone['name']]['type'])"></slot>
      </template>
    </vi-form-category>
  </template>
</template>

<script setup>
import { inject } from "vue"
import { getBoneWidget } from "../../bones/edit"
import ViFormCategory from "../ViFormCategory.vue"
const formState = inject("formState")
const formUpdate = inject("formUpdate")

const hasCategoryBones = (category) => {
  return category["bones"].some(
    (bone) => formState.structure[bone["name"]] && formState.structure[bone["name"]]["visible"]
  )
}
</script>

<style scoped></style>
