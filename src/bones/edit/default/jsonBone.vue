<template>
    <JsonEditorVue
    v-model="value_ref"
    :onChange="changeEvent"
    :readOnly="boneState.readonly"
  />

</template>

<script setup>
import JsonEditorVue from 'json-editor-vue'
import {onMounted, inject, ref} from "vue"
  const value_ref = ref();
  defineOptions({
    inheritAttrs: false
  })
  const props = defineProps({
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    readonly: Boolean,
    params: Object,
    bone:Object,
    autofocus: Boolean
  })

  const emit = defineEmits( ["change"])
    const boneState = inject("boneState")
    function changeEvent(newVal) {
      emit("change", props.name, newVal.json, props.lang, props.index)
    }

    onMounted(() => {
      emit("change", props.name, props.value, props.lang, props.index) //init
      value_ref.value=props.value;
    })

</script>

<style scoped>
.box {
  width: 100%;
  border: 1px solid var(--sl-color-gray-500);
  border-radius: 5px;
  min-height: 40px;
}

</style>
<style>
:root{
  --jse-theme-color: var(--sl-color-neutral-0);
  --jse-menu-color: var(--sl-color-neutral-800);
  --jse-theme-color-highlight:var(--sl-color-neutral-200);
}
</style>
