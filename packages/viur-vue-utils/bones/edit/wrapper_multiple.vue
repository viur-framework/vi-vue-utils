<template>
  <div class="value-line"
    @dragover="$emit('handleDragOver', $event)"
    @drop="$emit('handleDrop', $event)"
    :class="{'is-dragging': isDragging,
        'dragging-line-bottom': draggingLineBottom,
        'dragging-line-top': draggingLineTop}">
    <sl-button
      draggable="true"
      @dragstart="$emit('handleDragStart', $event)"
      @dragend="$emit('handleDragEnd')"
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
    "handleDrop"
  ],
  setup(props, context) {
    const state = reactive({});

    return { state };
  },
});
</script>

<style scoped lang="less">


.is-dragging {
  background-color: green;
}

.dragging-line-bottom {
  border-bottom: 2px solid blue
}
.dragging-line-top {
  border-top: 2px solid blue
}
.dragging-line-bottom {
  border-bottom: 2px solid blue
}
.value-line {
  display: flex;
  gap: 10px;
}

.value {
  width: 100%;
}

.delete-btn {
  &::part(base) {
    aspect-ratio: 1;
  }
}
</style>
