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
  --font-size: var(--sl-input-font-size-medium);
  --height: var(--sl-input-height-medium);
  --spacing-inline: var(--sl-input-spacing-medium);
  --color: var(--sl-color-neutral-900);
  --background: var(--sl-color-neutral-200);
  --border-width: 0;
  --border-style: none;
  --border-color: transparent;
  --border-radius: var(--sl-input-border-radius-medium);
  display: flex;
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  font-size: var(--font-size);
  min-height: var(--height);
  line-height: calc(var(--height) - 2 * var(--border-width));
  padding-inline: var(--spacing-inline);
  color: var(--color);
  background: var(--background);
  border-width: var(--border-width);
  border-style: var(--border-style);
  border-color: var(--border-color);
  border-radius: var(--border-radius) 0 0 var(--border-radius);
  word-break: break-word;
  @media (max-width: 900px) {
    --border-radius: var(--border-radius) var(--border-radius) 0 0;
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
