<template>
  <div class="wrapper widget-bone widget-bone-raw widget-bone-raw-default" :class="{'max-size':state.max}">
    <textarea ref="element" :disabled="boneState?.readonly"
          :placeholder="state.placeholder"
      :data-user-invalid="boneState.errorMessages.length === 0 ? undefined : true"
    ></textarea>
    <sl-icon-button :name=" state.max?'arrows-angle-contract':'arrows-angle-expand'" @click="state.max = !state.max"></sl-icon-button>
  </div>

  <input
        type="text"
        class="vi-textbone-hidden"
        :value="state.value"
        :required="
          boneState.bonestructure.required && !boneState.bonestructure.multiple && !boneState.bonestructure.languages
        "
      />
</template>

<script setup>
import { reactive, onMounted, inject, computed, ref } from "vue"
import { basicSetup } from "codemirror"
import { EditorView, keymap, drawSelection } from "@codemirror/view"
import { syntaxHighlighting, defaultHighlightStyle,LanguageDescription  } from "@codemirror/language"
import { indentLess, indentMore, indentWithTab, indentSelection, insertTab } from "@codemirror/commands"
import { indentString, indentUnit } from "@codemirror/language"
import { EditorState } from "@codemirror/state"
import {languages} from "@codemirror/language-data"


defineOptions({
  inheritAttrs: false,
})

const element = ref(null)
const view = ref(null)

const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String,
  bone: Object,
  autofocus: Boolean,
})

const emit = defineEmits(["change"])

const boneState = inject("boneState")
const state = reactive({
  placeholder: computed(() => {
    if (boneState.label !== "placeholder") return undefined
    let name = boneState?.bonestructure?.descr
    if (boneState.bonestructure.required) {
      name += "*"
    }
    return name
  }),
  value:"",
  max:false
})

function editorFromTextArea(textarea, extensions) {
  let _view = new EditorView({ doc: textarea.value, extensions })

  textarea.parentNode.insertBefore(_view.dom, textarea)
  textarea.style.display = "none"

  if (textarea.form) {
    textarea.form.addEventListener("submit", () => {
      textarea.value = _view.state.doc.toString()
    })
  }

  indentString(_view.state, 4)

  let listener = () => {
    let lines = ""
    for (let i = 0; i < _view.state.doc.lines; ++i) {
      let line = _view.state.doc.line(i + 1).text
      lines += line + "\n"
    }
    state.value = lines
    emit("change", props.name, state.value, props.lang, props.index)
  }

  _view.dom.addEventListener("input", listener)
  _view.dom.addEventListener("keyup", listener)
  _view.dom.addEventListener("paste", listener)
  _view.dom.addEventListener("cut", listener)
  return _view
}

async function build(){
  const exts = [
    basicSetup,
    syntaxHighlighting(defaultHighlightStyle),
    keymap.of([indentWithTab]),
    indentUnit.of("    "),
    EditorState.tabSize.of(4),
    EditorView.lineWrapping,
    drawSelection(),
  ]

  let langDesc = LanguageDescription.matchLanguageName(languages, boneState?.bonestructure?.type.replace("raw.code.",""))

  if (langDesc) {
    const support = await langDesc.load()
    exts.push(support)
  }

  if (boneState?.readonly){
    exts.push(EditorView.editable.of(false))
  }

  return exts
}

onMounted(async () => {
  if (props.value !== null) {
    state.value = props.value
  }
  const exts = await build()
  view.value = editorFromTextArea(element.value, exts)

  //init editor
  view.value.dispatch({
    changes: { from: 0, to: view.value.state.doc.length, insert: state.value },
  })

  emit("change", props.name, props.value, props.lang, props.index) //init
})
</script>

<style scoped>
.vi-textbone-hidden {
  max-height: 0;
  display: block;
  visibility: hidden;
  width: 100%;
  pointer-events: none;
}

sl-icon-button{
  position: absolute;
  bottom:0px;
  right: 10px;
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
.wrapper {
  position: relative;
  display: flex;
  height: 100%;
  width: 100%;
}
:deep(.cm-editor) {
  width: 100%;

  & .cm-scroller {
    min-height: 3em;
    max-height: 28em;
    overflow-y: auto;
  }
}

.wrapper.max-size :deep(.cm-editor) .cm-scroller {
    max-height: none;
}
</style>
