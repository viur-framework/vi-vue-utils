<template>
    <sl-input
      class="widget-bone widget-bone-email widget-bone-email-default"
      :class="([`widget-bone-email-${name}`])"
      :name="name"
      ref="emailBone"
      :disabled="boneState.readonly"
      type="password"
      password-toggle
      :value="value"
      @sl-change="changeEvent"
      :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
      :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
      :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
    ></sl-input>
  </template>
  
  <script setup>
  import { reactive, onMounted, inject, ref, watchEffect } from "vue"
  import { useTimeoutFn } from "@vueuse/core"
    defineOptions({
      inheritAttrs: false
    })
    const props = defineProps( {
      name: String,
      value: [Object, String, Number, Boolean, Array],
      index: Number,
      lang: String,
      bone:Object,
      autofocus: Boolean
    })
  
    const emit = defineEmits( ["change"])
  
      const boneState = inject("boneState")
      const state = reactive({})
  
      const emailBone = ref(null)
  
      function changeEvent(event) {
        emit("change", props.name, event.target.value, props.lang, props.index)
      }
  
      onMounted(() => {
        emit("change", props.name, props.value.trim(), props.lang, props.index) //init
      })
  
  </script>
  
  <style scoped>
sl-input {
        display: block;
        width: 100%;
        margin-bottom: var(--sl-spacing-x-small);
        
        &::part(base){
            border: solid var(--sl-input-border-width) var(--sl-input-border-color);
            background-color: var(--sl-input-background-color);
           
        }
        &:focus::part(base){
            background-color: var(--sl-input-background-color-focus);
            border-color: var(--sl-input-border-color-focus);
            box-shadow: 0 0 0 var(--sl-focus-ring-width) var(--sl-input-focus-ring-color);
        }
    }
  </style>
  