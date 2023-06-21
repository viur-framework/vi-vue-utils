<template>
  <div class="actionbar">
    <sl-button
      variant="danger"
      v-if="boneState.multiple && !readonly"
      @click="handleRemove(lang)"
      :title="$t('bone.del')"
      outline
      class="delete-btn"
    >
      <sl-icon name="x"></sl-icon>
    </sl-button>

    <sl-button
      variant="success"
      v-if="boneState.multiple && !readonly"
      @click="handleAdd(lang)"
      :title="$t('bone.add')"
      outline
      class="add-btn"
    >
      <sl-icon name="plus"></sl-icon>
      {{ $t("bone.add") }}
      <template v-if="state.counter > 1">({{ state.counter }})</template>
    </sl-button>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject } from "vue";

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String,
    readonly: Boolean,
    params: Object,
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState");
    const state = reactive({
      counter: 0,
      debounce: null,
    });
    const addMultipleEntry = inject("addMultipleEntry");
    const removeMultipleEntries = inject("removeMultipleEntries");

    function handleAdd() {
      state.counter += 1;
      let delay = 200;
      if (state.counter > 1) {
        delay = 500;
      }
      if (state.debounce) {
        clearTimeout(state.debounce);
      }
      state.debounce = setTimeout(() => {
        for (let i = state.counter; i--; ) {
          addMultipleEntry(props.lang);
        }
        state.counter = 0;
      }, delay);
    }

    function handleRemove() {
      let delay = 200;
      if (state.debounce) {
        clearTimeout(state.debounce);
      }
      state.debounce = setTimeout(() => {
        removeMultipleEntries(props.lang);
      }, delay);
    }

    return {
      state,
      boneState,
      handleAdd,
      handleRemove,
      removeMultipleEntries,
    };
  },
});
</script>

<style scoped lang="less">
.actionbar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.delete-btn {
  &::part(base) {
    aspect-ratio: 1;
  }
}

.add-btn {
  margin-left: auto;

  sl-icon {
    margin-right: var(--sl-spacing-x-small);
  }
}
</style>