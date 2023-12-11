<template>
  <div
    id="editor"
    ref="editor"
    class="box"
    @change="log"
  ></div>
  <sl-button @click="formatCodeInInstance">code formatieren</sl-button>
  <pre>{{ state.code }}</pre>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, ref, inject, watch, h } from "vue"
import { formatWithCursor, format } from "prettier"
import pluginTypescript from "prettier/plugins/typescript"
import pluginEstree from "prettier/plugins/estree"

import "prism-code-editor/grammars/json"
import "prism-code-editor/grammars/css-extras"
import "prism-code-editor/grammars/js-extras"

import "prism-code-editor/layout.css"
//import "prism-code-editor/code-folding.css"
import "prism-code-editor/copy-button.css"
import "prism-code-editor/scrollbar.css"
import "prism-code-editor/themes/dracula.css"
import "prism-code-editor/search.css"

//code editor
import { createEditor } from "prism-code-editor"

//code editor extensions
import { cursorPosition } from "prism-code-editor/cursor"
import { addTooltip } from "prism-code-editor/tooltips"
import { defaultCommands } from "prism-code-editor/commands"
import { matchBrackets } from "prism-code-editor/match-brackets"
import { indentGuides } from "prism-code-editor/guides"
import { searchWidget, highlightSelectionMatches, highlightCurrentWord } from "prism-code-editor/search"
import { copyButton } from "prism-code-editor/copy-button"
import { highlightBracketPairs } from "prism-code-editor/highlight-brackets"
//import { readOnlycodeFolding, markdownFolding, blockCommentFolding } from "prism-code-editor/code-folding"
import { insertText } from "prism-code-editor/utils"

export default defineComponent({
  props: {
    name: String,
    value: String,
    index: Number,
    lang: { type: String, default: "json" },
    readonly: { type: Boolean, default: true },
    dark: { type: Boolean, default: true },
    params: Object
  },

  components: {},

  emits: ["change"],

  setup(props, context) {
    const boneState = inject("boneState")

    //code editor variables
    const editor = ref(null)
    const editorInstance = ref(null)
    const tooltip = document.createElement("div")
    tooltip.className = "tooltip"
    tooltip.textContent = "Cannot edit read-only editor."

    const state = reactive({
      code: `[
  {
    "_id": "65720288ba78e8d177815130",
    "index": 0,
    "guid": "f019f431-91e3-4db9-bdce-ee296b47092b",
    "isActive": true,
    "balance": "$1,063.73","picture": "http://placehold.it/32x32",
    "age": 28,"eyeColor": "brown","tags": [
"consequat",
      "aliqua",
      "fugiat",
      "fugiat",
      "qui",
      "esse",
      "sit"
    ],
    "friends": [
      {
  "id": 0,
"name": "Rachael Reeves"
      },
      {
  "id": 1,
  "name": "Marisa Carr"
      },
      {
  "id": 2,
  "name": "Daisy Olson"
      }
    ]
  }
]`
    })

    function changeEvent(newVal, oldVal) {
      context.emit("change", props.name, newVal, props.lang, props.index)
    }

    function log(e) {
      console.log(e.target.value)
    }

    async function formatCodeInInstance() {
      const [start, end] = editorInstance.value.getSelection()
      const code = editorInstance.value.value

      const { formatted, cursorOffset } = await formatWithCursor(code, {
        cursorOffset: start,
        parser: "typescript",
        plugins: [pluginTypescript, pluginEstree]
      })
      const offsetEnd = cursorOffset + end - start

      if (formatted !== code) {
        insertText(editorInstance.value, formatted, 0, code.length, cursorOffset, offsetEnd)
      }
    }

    async function formatCode(code: String) {
      const formatted = await format(code, { parser: "typescript", plugins: [pluginTypescript, pluginEstree] })

      return formatted
    }

    watch(
      () => editorInstance.value,
      (newValue, oldValue) => {},
      { deep: true }
    )

    onMounted(async () => {
      editorInstance.value = createEditor(
        editor.value,
        {
          readOnly: props.readonly,
          language: props.lang,
          theme: "dracula",
          value: await formatCode(state.code)
        },
        searchWidget(),
        highlightSelectionMatches(),
        defaultCommands(),
        //matchTags(),
        matchBrackets(),
        indentGuides(),
        cursorPosition(),
        copyButton(),
        highlightBracketPairs(),
        highlightCurrentWord()
      )

      const [show, hide] = addTooltip(editorInstance.value, tooltip, true)

      editorInstance.value.textarea.addEventListener("beforeinput", () => show(), true)

      editorInstance.value.options.onSelectionChange = hide
      editorInstance.value.textarea.addEventListener("click", hide)

      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    return {
      state,
      boneState,
      changeEvent,
      log,
      editor,
      editorInstance,
      formatCodeInInstance,
      tooltip
    }
  }
})
</script>

<style>
.box {
  background: white;
  position: relative;
  width: 100%;
  border: 1px solid var(--sl-color-gray-500);
  border-radius: 5px;
  min-height: 40px;
}
.tooltip {
  background: rgb(58, 58, 58);
  padding: 0.4em;
  border: 1px solid black;
  border-radius: 0.4em;
  position: sticky;
  left: 0.5em;
  right: 0;
  white-space: normal;
  word-break: normal;
}
</style>
