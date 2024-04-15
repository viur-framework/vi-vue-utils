<template>
  <prism-editor
    v-if="boneState.bonestructure.type === 'raw.json'"
    v-model="state.value"
    class="my-editor"
    :highlight="highlighter"
    :readonly="boneState.bonestructure.readonly"
    line-numbers
    @input="changeEvent"
  >
  </prism-editor>
  <sl-textarea
    v-else
    :disabled="boneState?.readonly"
    :value="value"
    @input="changeEvent"
  ></sl-textarea>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject } from "vue"
import { PrismEditor } from "vue-prism-editor"
import "vue-prism-editor/dist/prismeditor.min.css" // import the styles somewhere

// import highlighting library (you can use any library you want just return html string)
import { highlight, languages } from "prismjs/components/prism-core"
import "prismjs/components/prism-clike"
import "prismjs/components/prism-javascript"
import "prismjs/themes/prism-tomorrow.css" // import syntax highlighting styles

import * as prettier from "prettier"
import pluginEstree from "prettier/plugins/estree"
import pluginBabel from "prettier/plugins/babel"

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String
  },
  components: { PrismEditor },
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      value: ""
    })

    //TODO: Save doesnt work because too many fields are sent (Bad Request Error)
    function changeEvent(event) {
      context.emit("change", props.name, event.target.value, props.lang, props.index)
    }

    function highlighter(code) {
      return highlight(code, languages.js) // languages.<insert language> to return html with markup
    }

    async function formatCode(code) {
      if (code !== "null" || code !== "undefined") {
        code = await prettier.format(code, { semi: false, parser: "json", plugins: [pluginEstree, pluginBabel] })
      }

      return code
    }

    onMounted(async () => {
      state.value = await formatCode(JSON.stringify(props.value))

      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    return {
      state,
      boneState,
      changeEvent,
      highlighter
    }
  }
})
</script>

<style scoped>
/* required class */
.my-editor {
  /* we dont use `language-` classes anymore so thats why we need to add background and text color manually */
  background: #2d2d2d;
  color: #ccc;

  /* you must provide font-family font-size line-height. Example: */
  font-family:
    Fira code,
    Fira Mono,
    Consolas,
    Menlo,
    Courier,
    monospace;
  font-size: 14px;
  line-height: 1.5;
  padding: 5px;
}

/* optional class for removing the outline */
.prism-editor__textarea:focus {
  outline: none;
}

sl-input {
  width: 100%;

  &::part(base) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  @media (max-width: 900px) {
    &::part(base) {
      border-top-right-radius: 0;
      border-bottom-left-radius: var(--sl-border-radius-medium);
    }
  }
}
</style>
