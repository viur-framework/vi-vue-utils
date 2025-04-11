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
    <div class="value">
      <slot></slot>
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

import { reactive, inject } from "vue"

  const props = defineProps( {
  })
  const emit = defineEmits(["change", "delete"])

    const boneState = inject("boneState")
    const state = reactive({

    })

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
</style>
