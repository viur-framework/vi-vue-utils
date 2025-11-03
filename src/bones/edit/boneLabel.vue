<template>
  <label class="bone-name label-bone">
    <slot v-if="!debug"></slot>
    <sl-tooltip v-else>
      <slot></slot>
      <div slot="content">{{ name }}</div>
    </sl-tooltip>
    <template v-if="debug">
      <div class="debug" @click="state.debug = !state.debug">
        <sl-icon name="bug"></sl-icon>
      </div>
    </template>
  </label>

  <sl-dialog v-if="state.debug" open :label="name" @sl-after-hide="state.debug = false">
    <pre>
        {{ boneState }}
      </pre
    >
  </sl-dialog>
</template>

<script setup>
import { reactive, onMounted, inject } from "vue"
const props = defineProps({
  name: String,
  value: Object,
  index: Number,
  lang: String,
  readonly: Boolean,
  params: Object,
  debug: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(["change", "handleClick"])

const boneState = inject("boneState")
const state = reactive({
  debug: false,
})
</script>

<style scoped>
@layer foundation.form {
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
}
</style>
