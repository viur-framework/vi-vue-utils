<template>
  <div
    class="value-line"
    :draggable="state.isDraggable"
    :class="{
      'is-dragging': isDragging,
      'dragging-line-bottom': draggingLineBottom,
      'dragging-line-top': draggingLineTop
    }"
    @dragover="emit('handleDragOver', $event)"
    @drop="emit('handleDrop', $event)"
    @dragstart="emit('handleDragStart', $event)"
    @dragend="emit('handleDragEnd')"
  >
    <sl-button
      :disabled="boneState.readonly"
      class="drag-button"
      @mousedown="state.isDraggable = true"
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
    isDragging: Boolean,
    draggingLineBottom: Boolean,
    draggingLineTop: Boolean
  })
  const emit = defineEmits(["change", "delete", "handleDragStart", "handleDragEnd", "handleDragOver", "handleDrop"])

    const boneState = inject("boneState")
    const state = reactive({
      isDraggable: false
    })

</script>

<style scoped>
.is-dragging {
  opacity: 0.4;
}

.dragging-line-bottom {
  margin-bottom: calc(-1 * var(--sl-spacing-x-small));
  border-bottom: var(--sl-spacing-x-small) solid var(--sl-color-neutral-300);
}

.dragging-line-top {
  margin-top: calc(-1 * var(--sl-spacing-x-small));
  border-top: var(--sl-spacing-x-small) solid var(--sl-color-neutral-300);
}

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
</style>
