<template>
  <div
    class="value-line"
  >
    <sl-button
      :disabled="boneState.readonly"
      class="drag-button"
    >
      <sl-icon
        slot="prefix"
        name="grip-vertical"
      >
      </sl-icon>
    </sl-button>
     <div class="row-wrapper">
    <div class="value">

      <slot></slot>

      </div>
      <bone-actions
          v-if="boneState.boneactions"
          :value="state.value"
          :name="name"
          :lang="lang"
          :index="index"
          :bone="boneState.bonestructure"
          @change="updateValue"
      >
      </bone-actions>
      </div>
    <sl-button
      variant="danger"
      :disabled="boneState.readonly"
      outline
      :title="$t('bone.del')"
      class="delete-btn"
      @click="emit('delete')"
    >
      <sl-icon
        slot="prefix"
        name="x-lg"
      ></sl-icon>
    </sl-button>
  </div>
</template>

<script setup>

import { reactive, inject,computed } from "vue"
import BoneActions from "./boneActions.vue";

  const props = defineProps( {
    index:Number,
    name:String,
    lang:{
      default:null
    }
  })

  const state = reactive({
    value:computed(()=>{
      if (props.lang){
        return boneState.bonevalue[props.lang][props.index]
      }
      return boneState.bonevalue[props.index]
    })
  })

  const emit = defineEmits(["change", "delete"])

    const boneState = inject("boneState")
    const updateValue = inject("updateValue")

</script>

<style scoped>

.value-line {
  display: flex;
  gap: var(--sl-spacing-x-small);
  align-items: flex-start;
}

.value {
  flex: 1 1 100%;
  width: 1px;

  & :deep(sl-input) {
    &::part(base) {
      border-bottom-left-radius: var(--sl-border-radius-medium);
      border-top-left-radius: var(--sl-border-radius-medium);
    }
  }

  & :deep(.bone-wrapper) {
    & sl-input::part(base) {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
  }

  &:deep(sl-alert){
    &::part(base){
      margin-top: 0;
    }
  }
}

.delete-btn {
  transition: all ease .3s;
}

.drag-button {
  &::part(base) {
    aspect-ratio: 1;
  }
}
.row-wrapper{
  width: 100%;
  display:flex;
  flex-direction: row;
  gap:var(--sl-spacing-x-small)
}
</style>
