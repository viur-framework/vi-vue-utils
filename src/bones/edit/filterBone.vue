<template>
  <div
    class="bone-wrapper wrapper-bone"
    :class="
      { 'has-subbones': state.bonestructure['using'],
        'label-top': label==='top',
        'label-hide': ['hide','placeholder'].includes(label),
        [`wrapper-bone-${state.bonestructure['type'].split('.')[0]}`]:true,
        [`wrapper-bone-${name}`]:true
      }
    "
  >
    <bone-label :name="name" v-if="!['hide','placeholder'].includes(label)">
      <span :class="{ required: state.required }">{{ state.bonestructure["descr"] }}</span>
      <span
        v-if="state.required"
        class="required"
      >
        *</span>
      <sl-tooltip
        v-if="state.hasTooltip && !showLabelInfo"
        :content="state.bonestructure.params['tooltip']"
        placement="top-center"
      >
        <div class="tooltip">
          <sl-icon name="question"></sl-icon>
        </div>
      </sl-tooltip>
    </bone-label>

    <sl-alert
      v-if="showLabelInfo && state.hasTooltip"
      variant="info"
      open
      class="label-info"
    >
      <sl-icon
        slot="icon"
        name="info-circle-fill"
      ></sl-icon>
      {{ state.bonestructure.params["tooltip"] }}
    </sl-alert>
    <sl-tooltip class="bone-tooltip" :disabled="!state.showtooltip" :content="state.bonestructure?.['descr']" style="--show-delay:1000;">
      <div class="bone-inner-wrap wrapper-bone-widget"
      :class="(
        [`wrapper-bone-widget-${name}`]
      )"
    >
      <div class="wrapper-bone-row">


        <sl-select style="width:100px" hoist :value="state.currentLanguage" @sl-change="updateLanguage" v-if="state.multilanguage">
          <sl-option v-for="lang in state.languages" :value="lang">{{ $t(lang) }}</sl-option>
        </sl-select>
        <div class="wrapper-bone-row">
          <div class="wrapper-bone-block">
            <component
              :is="is"
              :value="state.bonevalue"
              :name="name"
              :index="null"
              :bone="state.bonestructure"
              :autofocus="autofocus"
              @change="updateValue"
              @keypress.enter="updateValue"
            ></component>
          </div>
          <bone-actions v-if="state.boneactions"
              :value="state.bonevalue"
              :name="name"
              :index="null"
              :bone="state.bonestructure"
              @change="updateValue"

          ></bone-actions>
        </div>
      </div>
      <template v-if="errorStyle==='default'">
        <sl-alert
          v-for="message in state.errorMessages"
          open
          summary="Errors"
          variant="danger"
          class="error-msg"
        >
          <sl-icon
            slot="icon"
            name="exclamation-triangle"
          >
          </sl-icon>
          <div class="error-msg">
            {{ $t(`errors.${message}`) }}
          </div>
        </sl-alert>
      </template>
      <template v-else>
      <div v-for="message in state.errorMessages" style="font-size:0.8em;color:red;">
        {{ $t(`errors.${message}`) }}
      </div>
      </template>

    </div>
    </sl-tooltip>
  </div>
</template>

<script setup>
import {
  reactive,
  defineComponent,
  computed,
  onBeforeMount,
  provide,
  getCurrentInstance,
  onMounted,
  watch,
  ref
} from "vue"
import wrapperMultiple from "./wrapper_multiple.vue"
import BoneLabel from "./boneLabel.vue"
import { BoneHasMultipleHandling, getBoneActionbar } from "./index"
import rawBone from "./default/rawBone.vue"
import Utils from "../utils"
import { VueDraggable } from 'vue-draggable-plus'
import BoneActions from "./boneActions.vue";

  const emit = defineEmits(["change", "change-internal", "handleClick"])

  const props = defineProps({
    is: {
      type: Object,
      default: rawBone
    },
    name: {
      type: String,
      required: true
    },
    languages: Array,
    multiple: Boolean,
    readonly: Boolean,
    required: Boolean,
    params: Object,
    value: [Object, String, Number, Boolean, Array],
    structure: {
      type: Object,
      required: true
    },
    skel: {
      type: null,
      required: true
    },
    errors: Object,
    label:{
      type:String,
      default:"normal",
      validator(value,props){
        return ["normal","top","hide","placeholder"].includes(value)
      }
    },
    boneactions:{type:Boolean, default:false},
    showLabelInfo: { type: Boolean, required: false, default: false },
    autofocus: { type: Boolean, required: false, default: false },
    defaultLanguage: {type:String,default:"de"},
    showBoneTooltip: { type: Boolean, required: false, default: false },
    errorStyle:{
      type:String,
      default:"default",
      validator(value,props){
        return ["default","decent"].includes(value)
      }
    }
  })
    const state = reactive({
      boneactions:computed(()=>props.boneactions),
      bonestructure: computed(() => {
        let struct = props.structure?.[props.name]
        struct["multiple"] = false
        return struct
      }),
      bonevalue: null,
      multilanguage: computed(() => state.languages?.length && state.languages.length > 0),
      languages: computed(() => {
        if (props.languages) {
          return props.languages
        }
        return state.bonestructure && Object.keys(state.bonestructure).includes("languages")
          ? state.bonestructure["languages"]
          : []
      }),
      readonly: computed(() => {
        if (props.readonly) {
          return props.readonly
        }
        return state.bonestructure && Object.keys(state.bonestructure).includes("readonly")
          ? state.bonestructure["readonly"]
          : false
      }),
      required: computed(() => {
        if (props.required) {
          return props.required
        }
        return state.bonestructure && Object.keys(state.bonestructure).includes("required")
          ? state.bonestructure["required"]
          : false
      }),
      hasTooltip: computed(() => {
        return state.bonestructure && Object.keys(state.bonestructure["params"]).includes("tooltip") ? true : false
      }),

      multiple: computed(() => {
        if (props.multiple) {
          return props.multiple
        }
        return state.bonestructure && Object.keys(state.bonestructure).includes("multiple")
          ? state.bonestructure["multiple"]
          : false
      }),
      params: computed(() => {
        if (props.params) {
          return props.params
        }
        return state.bonestructure && Object.keys(state.bonestructure).includes("params")
          ? state.bonestructure["params"]
          : {}
      }),
      actionbar: computed(() => {
        return getBoneActionbar(state.bonestructure?.["type"])
      }),
      isEmpty: computed(() => {
        // Function to check if an object is empty
        function isObjectEmpty(obj) {
          for (const [key, value] of Object.entries(obj)) {
            if (value !== null) {
              if (Array.isArray(value) && value.length > 0) {
                return false
              } else if (!Array.isArray(value)) {
                return false
              }
            }
          }
          return true
        }

        // Ignore the computation when the state is readonly
        if (state.readonly) return false

        // Check for null or undefined values
        if (!state.bonevalue) return true

        // Check if the value is an array with elements
        if (Array.isArray(state.bonevalue) && state.bonevalue.length === 0) return true

        // Check if the value is an object and not an array, then use helper function to check if it's empty
        if (state.bonevalue === Object(state.bonevalue) && !Array.isArray(state.bonevalue))
          return isObjectEmpty(state.bonevalue)

        return false
      }),

      errors: [],
      errorMessages: computed(() => {
        let errors = []
        for (let error of props.errors) {
          if (
            error["fieldPath"][0] === props.name &&
            (
              error["fieldPath"].length===1 ||
              ((state.multilanguage || state.multiple) && error["fieldPath"].length===2) ||
              (state.multilanguage && state.multiple && error["fieldPath"].length===3)
            ) &&
            (error["severity"] > 2 || (state.required && (error["severity"] === 2 || error["severity"] === 0)))
          ) {
            //severity level???
            errors.push(error["errorMessage"])
          }
        }
        return errors
      }),
      label: computed(()=>props.label),
      showtooltip:computed(()=>{
        if (props.showBoneTooltip){
          return true
        }
        if (['hide','placeholder'].includes(props.label)){
          return true
        }
        return false
      }),
      defaultLanguage:computed(()=>props.defaultLanguage),
      currentLanguage:null
    })
    provide("boneState", state)

    function updateValue(
      name,
      val,
      lang= null,
      index = null,
      valid = true
    ) {
      if (val === undefined) return false
      if (valid){
        if (lang) {
          if (!state.bonevalue){
            state.bonevalue = {}
          }
          if (Object.keys(state.bonevalue).includes(lang) && index !== null) {
            state.bonevalue[lang][index] = val
          } else {
            state.bonevalue[lang] = val
          }
        } else if (index !== null) {
          state.bonevalue[index] = val
        } else {
          state.bonevalue = val
        }
      }

      if (state.readonly) return false

      let changeInternalObj = {
        name: name,
        value: val,
        lang: state.multilanguage?state.currentLanguage:null,
        index: index,
        valid: valid
      }

      emit("change-internal", changeInternalObj)
    }
    provide("updateValue", updateValue)

    function updateLanguage(e){
      state.currentLanguage = e.target.value
       let changeInternalObj = {
        name: props.name,
        value: state.bonevalue,
        lang: state.currentLanguage,
        index: null,
        valid: true
      }

      emit("change-internal", changeInternalObj)
    }

    function addMultipleEntry(lang = null, data = "") {
      if (lang) {
        if (Object.keys(state.bonevalue).includes(lang)) {
          state.bonevalue[lang].push(data)
        } else {
          state.bonevalue[lang] = [data]
        }
      } else {
        if (state.bonevalue) {
          state.bonevalue.push(data)
        } else {
          state.bonevalue = [data]
        }
      }
    }
    provide("addMultipleEntry", addMultipleEntry)

    function removeMultipleEntry(index, lang = null) {
      if (lang) {
        state.bonevalue?.[lang].splice(index, 1)
      } else {
        state.bonevalue.splice(index, 1)
      }

      if (lang){
        updateValue(props.name, state.bonevalue[lang], lang)
      }else{
        updateValue(props.name, state.bonevalue)
      }
    }

    function removeMultipleEntries(lang = null) {
      if (lang) {
        state.bonevalue?.[lang].splice(0)
      } else {
        state.bonevalue.splice(0)
      }
      if (lang){
        updateValue(props.name, state.bonevalue[lang], lang)
      }else{
        updateValue(props.name, state.bonevalue)
      }
    }

    provide("removeMultipleEntries", removeMultipleEntries)

    function formatString(formatstr, boneValue) {
      return Utils.formatString(formatstr,boneValue)
    }
    provide("formatString", formatString)

    onBeforeMount(() => {
      if (props.value) {
        state.bonevalue = props.value
      } else {
        state.bonevalue = props.skel?.[props.name]
      }
      state.currentLanguage = state.defaultLanguage
    })

    watch(
      () => props.skel?.[props.name],
      (newVal, oldVal) => {
        state.bonevalue = props.skel?.[props.name]
      }
    )

    watch(
      () => props.errors?.[props.name],
      (newVal, oldVal) => {
        state.errors = props.errors
      }
    )
</script>

<style scoped>
@layer foundation.form {
  .bone-wrapper {
    display: grid;
    grid-template-columns: 235px 1fr;
    grid-gap: var(--sl-spacing-small);
    margin-bottom: 20px;

    &.bone-wrapper-record,
    &.label-top,
    &.has-subbones {
      display: flex;
      flex-direction: column;
      grid-gap: 0;

      & > :deep(.bone-name) {
        border-bottom-left-radius: 0;
        border-top-right-radius: var(--sl-border-radius-medium);
        min-width: 235px;
      }

      & > .bone-inner-wrap {
        padding-top: var(--sl-spacing-small);
        border-top: 2px solid var(--sl-color-neutral-300);
        margin-bottom: 5px;
      }

      & .multiple-bone {
        border-bottom: 1px solid var(--sl-color-neutral-300);
        padding-bottom: var(--sl-spacing-small);
        margin-bottom: var(--sl-spacing-small);

        &:deep(sl-details) {
          &:last-child {
            &::part(base) {
              border-bottom: none;
            }
          }
        }
      }
    }

    &.label-hide {
      display: flex;
      flex-direction: column;
      grid-gap: 0;
    }

    @media (max-width: 900px) {
      grid-template-columns: 1fr;
    }
  }

  sl-tab-panel::part(base) {
    padding: 0;
  }

  .lang-tab {
    width:100%;
    --track-width: 0;
    --indicator-color: var(--vi-background-color);
    --track-color: var(--vi-border-color);

    &::part(body) {
      padding-bottom: var(--sl-spacing-x-small);
      overflow-x: hidden;
    }

    &::part(tabs) {
      border-top: 1px solid var(--vi-border-color);
    }

    & sl-tab {
      margin-top: -1px;

      &[aria-selected="true"] {
        z-index: 1;

        &::part(base) {
          background-color: var(--vi-background-color);
          border: 1px solid var(--vi-border-color);
          border-top: 1px solid var(--vi-background-color) !important;
          border-bottom: 2px solid var(--sl-color-primary-500) !important;
        }
      }

      &::part(base) {
        background-color: var(--sl-color-neutral-200);
        border: 1px solid var(--sl-color-neutral-400);
        border-top: 1px solid var(--vi-border-color);
        border-radius: 0;
        padding: var(--sl-spacing-x-small);
        transition: all ease 0.3s;
      }

      &:hover {
        &::part(base) {
          background-color: var(--vi-background-color);
          border: 1px solid var(--vi-border-color);
        }
      }

      &:first-child {
        &::part(base) {
          border-bottom-left-radius: 5px;
        }
      }

      &:nth-last-child(2) {
        &::part(base) {
          border-bottom-right-radius: 5px;
        }
      }

      &:not(:first-child) {
        &::part(base) {
          margin-left: -1px;
        }
      }
    }
  }

  .multiple-placeholder {
    &:not(.readonly) {
      margin-bottom: var(--sl-spacing-x-small);
    }

    & sl-input {
      &::part(base) {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        opacity: 0.7;
      }
    }

    @media (max-width: 900px) {
      & sl-input {
        &::part(base) {
          border-top-right-radius: 0;
          border-bottom-left-radius: var(--sl-border-radius-medium);
        }
      }
    }
  }

  .multiple-bone {
    margin-bottom: var(--sl-spacing-x-small);

    & .bone-wrapper {
      margin-bottom: var(--sl-spacing-x-small);
    }

    &:first-child {
      & :deep(.value-line) {

      }
    }
  }

  .bone-inner-wrap {
    min-width: 1px;

    & sl-alert {
      margin-top: var(--sl-spacing-x-small);
      background-color: transparent;

      &::part(message) {
        padding: var(--sl-spacing-x-small) var(--sl-spacing-small);
      }

      &::part(icon) {
        padding-left: var(--sl-spacing-small);
      }
    }
  }

  .label-info {
    &::part(base) {
      align-items: center;
      margin-left: 0.5em;
      background-color: var(--sl-color-info-50);
      border: none;
      overflow: visible;
    }

    &::part(message) {
      padding: var(--sl-spacing-small);
    }

    &::part(icon) {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background-color: var(--sl-color-neutral-0);
      width: 1em;
      height: 1em;
      margin-left: -0.5em;
      padding-left: 0;
    }
  }

  .tooltip {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: auto;
    padding-left: 0.4em;

    & sl-icon {
      background-color: var(--sl-color-info-500);
      color: #fff;
      padding: 0.4em;
      border-radius: 50%;
      font-size: 0.55em;
    }
  }

  sl-tooltip {
    &::part(body) {
      background-color: var(--sl-color-info-500);
    }

    &::part(base__arrow) {
      background-color: var(--sl-color-info-500);
    }
  }

  .required {
    color: var(--sl-color-primary-500);
    font-weight: 700;
  }

  :deep(sl-combobox) {
    &::part(input__base) {
      border: 1px solid var(--vi-border-color);
      box-shadow: none !important;
    }

    &::part(input__prefix) {
      display: none !important;
    }

    &::part(input__suffix) {
      display: none !important;
    }
  }

  sl-tooltip.bone-tooltip {
    &::part(body) {
      background-color: var(--sl-color-primary-500);
    }

    &::part(base__arrow) {
      background-color: var(--sl-color-primary-500);
    }
  }
}

.error-msg::part(base){
  background-color: #ffecec;
  color:var(--sl-color-danger-700);
}

.wrapper-bone-row{
  display:flex;
  flex-direction: row;
  gap:var(--sl-spacing-x-small)
}

.wrapper-bone-block{
  display:block;
  width:100%;
}
</style>

<style>
sl-input[data-user-invalid]::part(base),
sl-select[data-user-invalid]::part(combobox),
sl-checkbox[data-user-invalid]::part(control) {
    border-color: var(--sl-color-danger-500);
  }


</style>
