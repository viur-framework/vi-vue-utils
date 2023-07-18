<template>
  <div
    class="value-line"
    :draggable="state.isDraggable"
    @dragover="$emit('handleDragOver', $event)"
    @drop="$emit('handleDrop', $event)"
    @dragstart="$emit('handleDragStart', $event)"
    @dragend="$emit('handleDragEnd')"
    :class="{
      'is-dragging': isDragging,
      'dragging-line-bottom': draggingLineBottom,
      'dragging-line-top': draggingLineTop,
    }"
  >
    <sl-button
      @mousedown="state.isDraggable = true"
      @mouseout="state.isDraggable = false"
      class="drag-button"
    >
      <sl-icon name="draggable"> </sl-icon>
    </sl-button>
    <div class="value">
      <slot></slot>
    </div>
    <sl-button
      variant="danger"
      outline
      @click="$emit('delete')"
      :title="$t('bone.del')"
      class="delete-btn"
    >
      <sl-icon name="x"></sl-icon>
    </sl-button>
  </div>
</template>

<script lang="ts">
import { reactive, defineComponent } from "vue";

export default defineComponent({
  props: {
    isDragging: Boolean,
    draggingLineBottom: Boolean,
    draggingLineTop: Boolean,
  },
  components: {},
  emits: [
    "change",
    "delete",
    "handleDragStart",
    "handleDragEnd",
    "handleDragOver",
    "handleDrop",
  ],
  setup(props, context) {
    const state = reactive({
      isDraggable: false,
    });

    return { state };
  },
});
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
  gap: 10px;
}

.value {
  width: 100%;

  :deep(sl-input) {
    &::part(base) {
      border-bottom-left-radius: var(--sl-border-radius-medium);
      border-top-left-radius: var(--sl-border-radius-medium);
    }
  }

  :deep(.bone-wrapper) {
    sl-input::part(base) {
      border-bottom-left-radius: 0;
      border-top-left-radius: 0;
    }
  }
}

.delete-btn {
  &::part(base) {
    aspect-ratio: 1;
  }
}

.drag-button {
  &::part(base) {
    aspect-ratio: 1;
  }
}
</style>
