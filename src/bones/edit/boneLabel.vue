<template>
  <label class="bone-name">
    <slot></slot>
    <template v-if="false">
      <div
        class="debug"
        @click="state.debug = !state.debug"
      >
        <sl-icon name="bug"></sl-icon>
      </div>
    </template>
  </label>
  <div v-if="state.debug">
    <div class="bone">{{ name }}</div>
    <pre>
    {{ boneState }}
    </pre>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject } from "vue"

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String,
    readonly: Boolean,
    params: Object
  },
  components: {},
  emits: ["change", "handleClick"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      debug: false
    })
    return {
      state,
      boneState
    }
  }
})
</script>

<style scoped>
.bone-name {
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  font-size: var(--sl-input-font-size-medium);
  min-height: var(--sl-input-height-medium);
  padding: 0.4em 0.7em;
  color: var(--sl-color-neutral-900);
  background-color: var(--sl-color-neutral-200);
  border: none;
  border-top-left-radius: var(--sl-input-border-radius-medium);
  border-bottom-left-radius: var(--sl-input-border-radius-medium);
  word-break: break-word;

  @media (max-width: 900px) {
    border-top-right-radius: var(--sl-input-border-radius-medium);
    border-bottom-left-radius: 0;
  }
}
.debug {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding-left: 0.4em;

  & sl-icon {
    background-color: var(--sl-color-danger-500);
    color: #fff;
    padding: 0.4em;
    border-radius: 50%;
    font-size: 0.55em;
  }
}
</style>
