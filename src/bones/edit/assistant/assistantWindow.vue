<template>
  <teleport
    v-if="open"
    to="body"
    :disabled="!open"
  >
    <sl-dialog
      open
      :label="action['name'] +' - '+ name"
      class="relation-popup"
      @sl-after-hide="CloseActionEvent"
    >

      <component :is="actions[action['arg']]"
                  :name="name"
                  :module="module"
                  :tabId="tabId"
                  :action="action"
                  :params="params"
                  @close="CloseAction"
                  @next="NextAction"
      >
      </component>
    </sl-dialog>
  </teleport>
</template>

<script setup>

import {reactive, defineComponent, onMounted, inject, computed,watch} from "vue"
import { Request } from "@viur/vue-utils"
import translation from "./translation.vue"
import describeImage from './describeImage.vue'

const actions = {
  "translate":translation,
  "describe_image":describeImage
}

const props = defineProps({
    open: Boolean,
    name: String,
    module: String,
    tabId: String,
    params:Object,
    action:Object
  })

  const emit = defineEmits(["close",'next'])

    function NextAction(val,lang=null) {
      emit("next",val,lang,props.action)
    }
    function CloseAction(val,lang=null) {
      console.log(val)
      emit("close",val,lang,props.action)
    }
    function CloseActionEvent(){
      emit("close",null,null,props.action)
    }

</script>

<style scoped>
.relation-popup {
  --width: 85%;

  &::part(body) {
    display: contents;
  }

  &::part(base) {
    position: absolute;
    height: 100%;
  }

  &::part(panel) {
    margin-bottom: 40px;
    max-width: 1400px;
  }


  &::part(footer) {
    padding: var(--sl-spacing-small);
  }

  &::part(overlay) {
    position: absolute;
  }

  &:deep(.bar sl-button[variant="success"]) {
    &::part(base) {
      background-color: transparent;
      border: 1px solid var(--sl-color-success-500);
      aspect-ratio: 1;
      padding: 0;
    }

    &::part(label) {
      display: none;
    }

    &::part(prefix) {
      color: var(--sl-color-success-500);
    }
  }
}

</style>
