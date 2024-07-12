<template>
  <template v-if="state.editor">
    <ckeditor
      v-if="boneState.bonestructure['validHtml']"
      v-model="state.value"
      :editor="state.editor"
      :config="state.editorConfig"
      :disabled="boneState?.readonly"
      @ready="onReady"
      @input="changeEvent"
    >
    </ckeditor>
    <sl-textarea
      v-else
      :disabled="boneState?.readonly"
      :value="value"
      @input="changeEventTextarea"
    ></sl-textarea>
  </template>
</template>

<script>
import { reactive, useAttrs, onMounted, inject, computed, watch } from "vue"
import ClassicEditor from "@viur/ckeditor5-build-classic"

const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String
})

const emit = defineEmits(["change"])
const attrs = useAttrs() // This hook collects all attributes that are not props

const boneState = inject("boneState")

const state = reactive({
  value: "",
  editorConfig: {},
  editor: computed(() => ClassicEditor)
})

function changeEvent(event) {
  emit("change", props.name, state.value, props.lang, props.index)
}
function changeEventTextarea(event) {
  state.value = event.target.value
  emit("change", props.name, state.value, props.lang, props.index)
}

onMounted(() => {
  if (props.value !== null) {
    state.value = props.value
  }

  emit("change", props.name, props.value, props.lang, props.index) //init
})

function onReady(editor) {
  editor.editing.view.change((writer) => {
    writer.setStyle("min-height", "250px", editor.editing.view.document.getRoot())
  })
}
watch(
  () => props.value,
  (newVal, oldVal) => {
    state.value = newVal
  }
)
</script>

<style>
.bone-inner-wrap {
  .ck-editor {
    /* Overrides the border radius setting in the theme. */
    --ck-border-radius: 0px;

    /* Overrides the default font size in the theme. */
    --ck-font-size-base: 14px;

    /* Helper variables to avoid duplication in the colors. */
    --ck-custom-background: var(--sl-color-neutral-200);
    --ck-custom-foreground: var(--sl-color-neutral-900);
    --ck-custom-border: var(--sl-color-neutral-100);
    --ck-custom-white: var(--sl-color-neutral-50);

    /* -- Overrides generic colors. ------------------------------------------------------------- */
    --ck-color-base-foreground: var(--ck-custom-background);
    --ck-color-base-background: var(--ck-custom-background);
    --ck-color-base-border: var(--sl-color-neutral-300);
    --ck-color-focus-border: var(--sl-color-neutral-700);
    --ck-color-text: var(--sl-color-neutral-900);
    --ck-color-shadow-drop: hsla(0, 0%, 0%, 0.2);
    --ck-color-shadow-inner: hsla(0, 0%, 0%, 0.1);

    /* -- Overrides the default .ck-button class colors. ---------------------------------------- */
    --ck-color-button-default-background: var(--ck-custom-background);
    --ck-color-button-default-hover-background: var(--sl-color-neutral-50);
    --ck-color-button-default-active-background: var(--sl-color-neutral-50);
    --ck-color-button-default-active-shadow: hsl(270, 2%, 23%);
    --ck-color-button-default-disabled-background: var(--ck-custom-background);

    --ck-color-button-on-hover-background: var(--sl-color-neutral-50);
    --ck-color-button-on-active-background: hsl(255, 4%, 14%);
    --ck-color-button-on-active-shadow: hsl(240, 3%, 19%);
    --ck-color-button-on-disabled-background: var(--ck-custom-foreground);

    --ck-color-button-on-color: var(--sl-color-primary-500);
    --ck-color-button-on-background: var(--sl-color-neutral-100);
    --ck-focus-ring: 1px solid var(--sl-color-primary-500);
    --ck-focus-outer-shadow: none;

    --ck-powered-by-text-color: var(--ck-custom-foreground);
    --ck-powered-by-background: var(--ck-custom-background);

    --ck-color-button-action-background: var(--sl-color-primary-600);
    --ck-color-button-action-hover-background: var(--sl-color-primary-500);
    --ck-color-button-action-active-background: var(--sl-color-primary-500);
    --ck-color-button-action-active-shadow: var(--sl-color-primary-500);
    --ck-color-button-action-disabled-background: var(--sl-color-primary-600);
    --ck-color-button-action-text: var(--ck-custom-white);

    /* -- Overrides the default .ck-dropdown class colors. -------------------------------------- */
    --ck-color-dropdown-panel-background: var(--ck-custom-background);
    --ck-color-dropdown-panel-border: var(--sl-color-neutral-400);

    /* -- Overrides the default .ck-splitbutton class colors. ----------------------------------- */
    --ck-color-split-button-hover-background: var(--ck-color-button-default-hover-background);
    --ck-color-split-button-hover-border: var(--ck-custom-foreground);

    /* -- Overrides the default .ck-labeled-field-view class colors. ---------------------------- */
    --ck-color-labeled-field-label-background: var(--ck-custom-background);

    /* -- Overrides the default .ck-list class colors. ------------------------------------------ */
    --ck-color-list-background: var(--ck-custom-background);
    --ck-color-list-button-hover-background: var(--sl-color-neutral-50);
    --ck-color-list-button-on-background: var(--sl-color-primary-500);
    --ck-color-list-button-on-background-focus: var(--sl-color-primary-500);
    --ck-color-list-button-on-text: var(--ck-color-base-background);

    /* -- Overrides the default .ck-balloon-panel class colors. --------------------------------- */
    --ck-color-panel-background: var(--ck-custom-background);
    --ck-color-panel-border: var(--ck-custom-border);

    /* -- Overrides the default .ck-toolbar class colors. --------------------------------------- */
    --ck-color-toolbar-background: var(--ck-custom-background);
    --ck-color-toolbar-border: var(--ck-custom-border);

    /* -- Overrides the default .ck-tooltip class colors. --------------------------------------- */
    --ck-color-tooltip-background: hsl(252, 7%, 14%);
    --ck-color-tooltip-text: hsl(0, 0%, 93%);

    /* -- Overrides the default colors used by the ckeditor5-image package. --------------------- */
    --ck-color-image-caption-background: var(--ck-custom-background);
    --ck-color-image-caption-text: var(--ck-custom-foreground);

    /* -- Overrides the default colors used by the ckeditor5-link package. ---------------------- */
    --ck-color-link-default: var(--sl-color-primary-500);

    width: 100% !important;

    .ck-content {
      background: transparent !important;
      border: 1px solid var(--vi-border-color) !important;
      width: 100%;
      /*height: 250px;*/
      border-bottom-left-radius: var(--sl-border-radius-medium) !important;
      border-bottom-right-radius: var(--sl-border-radius-medium) !important;

      &.ck-focused {
        border: 1px solid var(--sl-color-neutral-600) !important;

        .ck-source-editing-area {
          & textarea,
          & td {
            border: 1px solid var(--sl-color-neutral-600) !important;
          }
        }
      }
    }

    .ck-toolbar {
      height: var(--sl-input-height-medium);
      border-color: var(--vi-border-color);
      background-color: var(--vi-background-color);
    }

    .ck-button {
      border-color: none;
      background-color: var(--vi-background-color);
      cursor: pointer;

      &:hover {
        background-color: var(--sl-color-neutral-200) !important;
      }

      &.ck-on {
        background-color: var(--vi-background-color) !important;
        border: 1px solid var(--sl-color-primary-500) !important;
        color: var(--sl-color-primary-500) !important;
      }
    }

    .ck-source-editing-area {
      width: 100%;
      /*height: 250px;*/

      & textarea {
        background-color: transparent;
        color: var(--ck-custom-foreground);
        border: 1px solid var(--vi-border-color) !important;
        border-bottom-left-radius: var(--sl-border-radius-medium) !important;
        border-bottom-right-radius: var(--sl-border-radius-medium) !important;
      }
    }
  }
  .ck-content .table {
    margin: 0.9em 0;
  }
}

.ck-body-wrapper {
  .ck-link-form {
    width: 500px !important;
    max-width: 37vw !important;
    min-width: 180px !important;

    .ck-labeled-field-view {
      width: 100%;
    }

    .ck-input {
      width: 100%;
    }
  }
}

sl-textarea {
  &::part(base) {
    box-shadow: none !important;
    background-color: transparent;
  }

  &::part(textarea) {
    background-color: transparent;
    border: 1px solid var(--vi-border-color);
    border-radius: var(--sl-border-radius-medium);
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
