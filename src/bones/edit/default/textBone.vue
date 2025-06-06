<template>
  <template v-if="state.editor">
    <template v-if="boneState.bonestructure?.['valid_html'] || boneState.bonestructure?.['validHtml']">
    <ckeditor
      v-model="state.value"
      :editor="state.editor"
      :config="state.editorConfig"
      :disabled="boneState?.readonly"
      :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
      @ready="onReady"
      @input="changeEvent"
      class="widget-bone widget-bone-text widget-bone-text-default"
      :class="([`widget-bone-text-${name}`],[`widget-bone-text-${name}-html`])"
      :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
    >
    </ckeditor>
    <input type="text" class="vi-textbone-hidden" :value="state.value" :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"></input>
    </template>
    <sl-textarea
      v-else
      class="widget-bone widget-bone-text widget-bone-text-default"
      :class="([`widget-bone-text-${name}`])"
      :disabled="boneState?.readonly"
      :value="value"
      @input="changeEventTextarea"
      :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
      :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
      :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
    ></sl-textarea>
  </template>
</template>

<script setup>
import { reactive, onMounted, inject, computed, watch, onBeforeMount } from "vue"
import { Ckeditor } from '@ckeditor/ckeditor5-vue'
import { ClassicEditor, Essentials, Paragraph, Bold, Italic, SourceEditing,
  BlockQuote,Heading,Image,ImageStyle,ImageToolbar,ImageUpload,ImageResizeButtons, FileRepository, ImageBlock,ImageInline,
    Indent,IndentBlock,Link,List,Table,TableToolbar,TextTransformation,Underline,Alignment,RemoveFormat,GeneralHtmlSupport



} from 'ckeditor5'
import coreTranslations from 'ckeditor5/translations/de.js'
import 'ckeditor5/ckeditor5.css';
import {ViURUploadAdapterPlugin} from "./texteditor/uploadAdapter";

defineOptions({
    inheritAttrs: false
  })
  const props = defineProps( {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    bone:Object,
    autofocus: Boolean
  })

  const emit = defineEmits(["change"])

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

    onBeforeMount(()=>{
      let toolbarActions = {
        "heading":"h1",
        "bold":"b",
        "italic":"i",
        "underline":"u",
        "numberedList":"ol",
        "bulletedList":"ul",
        "blockQuote":"blockquote",
        "link":"a",
        "insertTable":"table",
        "imageUpload":"img"
      }

      let defaultSet = ["heading","|", "bold", "italic","underline",
        "|","alignment","numberedList", "bulletedList","blockQuote",
        "|","indent","outdent","|","link","insertTable","imageUpload",
        "|","undo","redo","RemoveFormat","sourceEditing"]

      defaultSet = defaultSet.filter(i=>{
        if (!Object.keys(toolbarActions).includes(i)){
          return true
        }

        if (boneState.bonestructure?.['valid_html']?.["validTags"].includes(toolbarActions[i])){
          return true
        }
        if (boneState.bonestructure?.['validHtml']?.["validTags"].includes(toolbarActions[i])){
          return true
        }
        return false
      })

      state.editorConfig = {
          licenseKey: "GPL",
          translations:[
              coreTranslations
          ],
          toolbar: defaultSet,
          plugins: [ Essentials,Heading, Paragraph, Bold,List,ImageUpload, Italic, Underline,ImageBlock,ImageInline,
            Alignment,Link,BlockQuote,Indent,Table,RemoveFormat,ImageStyle,ImageToolbar,ImageResizeButtons,
            IndentBlock,TableToolbar,TextTransformation,GeneralHtmlSupport, Image,SourceEditing,FileRepository,ViURUploadAdapterPlugin
          ],
          link: {
            decorators: [
                  {
                      mode: 'manual',
                      label: 'Link in neuem Fester öffnen',
                      attributes: {
                          target: '_blank',
                        rel:"noopener noreferrer"
                      }
                  }
              ]
          },
        image: {
          toolbar: [
            'imageStyle:inline',
            'imageStyle:block',
            'imageStyle:side',
            '|',
            'resizeImage:50',
                  'resizeImage:75',
                  'resizeImage:original',
            'imageTextAlternative'
          ],
          resizeOptions: [
                {
                    name: 'resizeImage:original',
                    value: null,
                    icon: 'original'
                },
                {
                    name: 'resizeImage:50',
                    value: '50',
                    icon: 'medium'
                },
                {
                    name: 'resizeImage:75',
                    value: '75',
                    icon: 'large'
                }
            ],
        },
        table: {
          contentToolbar: [
            'tableColumn',
            'tableRow',
            'mergeTableCells'
          ]
        },
        heading: {
                options: [
            { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
            { model: 'heading1', view: 'h1', title: 'Heading 1', class: 'ck-heading_heading1' },
            { model: 'heading2', view: 'h2', title: 'Heading 2', class: 'ck-heading_heading2' },
            { model: 'heading3', view: 'h3', title: 'Heading 3', class: 'ck-heading_heading3' },
            { model: 'heading4', view: 'h4', title: 'Heading 4', class: 'ck-heading_heading4' },
            { model: 'heading5', view: 'h5', title: 'Heading 5', class: 'ck-heading_heading5' },
            { model: 'heading6', view: 'h6', title: 'Heading 6', class: 'ck-heading_heading6' }
          ]
            },
        alignment: {
          options: [
            { name: 'left', className: 'viur-txt-align--left' },
            { name: 'right', className: 'viur-txt-align--right' },
            { name: 'center', className: 'viur-txt-align--center' },
            { name: 'justify', className: 'viur-txt-align--justify' },
          ]
        },
        indentBlock: {
                classes: [
                    'viur-txt-indent--1',
                    'viur-txt-indent--2',
                    'viur-txt-indent--3',
                    'viur-txt-indent--4',
                    'viur-txt-indent--5',
                    'viur-txt-indent--6',
                    'viur-txt-indent--7',
                    'viur-txt-indent--8',
                    'viur-txt-indent--9',
                    'viur-txt-indent--10',
                ]
            },

        htmlSupport: {
          allow: [
            {
              name: 'a',
              attributes: {
                target: true,
                rel: true
              }
            }
          ]
        },
        language: 'de',
        viur_api_url: 'http://localhost:8080'
      }
    })

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

      const codePlugin = editor.plugins.get("SourceEditing")

      codePlugin.on("change:isSourceEditingMode", (_eventInfo, _name, value) => {
        if (value) {
          const sourceEditingTextarea = editor.editing.view.getDomRoot()?.nextSibling?.firstChild;
          sourceEditingTextarea.addEventListener('focusout', (event) => {
            if (event.relatedTarget?.classList.contains("ck")){
              return
            }
            codePlugin.isSourceEditingMode=false
          });
        }
      });
    }

    watch(
      () => props.value,
      (newVal, oldVal) => {
        if (!newVal){
          state.value = ""
        }else{
          state.value = newVal
        }
      }
    )

</script>

<style scoped>
.vi-textbone-hidden{
  max-height:0;
  display:block;
  visibility: hidden;
  width: 100%;
  pointer-events: none;
}
</style>

<style>
.viur-txt-align--left{
	text-align: left;
}
.viur-txt-align--right{
	text-align: right;
}
.viur-txt-align--center{
	text-align: center;
}
.viur-txt-align--justify{
	text-align: justify;
}
.viur-txt-indent--1{
	margin-left: 1em;
}
.viur-txt-indent--2{
	margin-left: 2em;
}
.viur-txt-indent--3{
	margin-left: 3em;
}
.viur-txt-indent--4{
	margin-left: 4em;
}
.viur-txt-indent--5{
	margin-left: 5em;
}
.viur-txt-indent--6{
	margin-left: 6em;
}
.viur-txt-indent--7{
	margin-left: 7em;
}
.viur-txt-indent--8{
	margin-left: 8em;
}
.viur-txt-indent--9{
	margin-left: 9em;
}
.viur-txt-indent--10{
	margin-left: 10em;
}


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

      h1{
        font-size: 1.6em;
        font-weight: 700;
      }

      h2{
        font-size: 1.5em;
        font-weight: 700;
      }

      h3{
        font-size: 1.4em;
        font-weight: 700;
      }

      h4{
        font-size: 1.3em;
        font-weight: 700;
      }

      h5{
        font-size: 1.2em;
        font-weight: 700;
      }

      h6{
        font-size: 1.1em;
        font-weight: 700;
      }

      a:hover{
        text-decoration: underline;
      }

      ul{
        list-style: disc;
        padding-left: var(--sl-spacing-medium);
        list-style-position: inside;
      }

      ol{
        padding-left: var(--sl-spacing-medium);
        list-style-position: inside;
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


.ck-body-wrapper{
  .ck-link-form{
    padding-top:5px!important;
      width: 500px !important;
      max-width: 37vw !important;
      min-width: 180px !important;

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
