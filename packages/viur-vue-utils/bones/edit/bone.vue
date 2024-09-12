<template>
  <div
    class="bone-wrapper"
    :class="
      ('bone-wrapper-' + state.bonestructure['type'].split('.')[0], { 'has-subbones': state.bonestructure['using'],
        'label-top': label==='top',
        'label-hide': label==='hide',
      })
    "
  >
    <bone-label :name="name" v-if="label!=='hide'">
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
        library="bootstrap"
        name="info-circle-fill"
      ></sl-icon>
      {{ state.bonestructure.params["tooltip"] }}
    </sl-alert>
    <div class="bone-inner-wrap">
      <!--Language chooser -->
      <sl-tab-group
        v-if="state.multilanguage"
        class="lang-tab"
        placement="bottom"
      >
        <template
          v-for="lang in state.languages"
          :key="lang + '_tab'"
        >
          <sl-tab
            slot="nav"
            :panel="'lang_' + lang"
          >
            {{ $t(lang) }}
          </sl-tab>

          <sl-tab-panel :name="'lang_' + lang">
            <!--Bone rendering for multiple bones-->
            <template v-if="state.multiple && !BoneHasMultipleHandling(state.bonestructure['type'])">
              <!--multilang and multiple-->
              <div
                v-for="(val, index) in state.bonevalue?.[lang]"
                v-if="state.bonevalue?.[lang].length"
                :key="index+'_'+state.bonevalue[lang].length"
                class="multiple-bone"
              >
                <wrapper-multiple
                  :readonly="!state.readonly"
                  :is-dragging="state.isDragging['lang'] === lang && state.isDragging['index'] === index ? true : false"
                  :dragging-line-bottom="
                    state.draggingLineBottom['lang'] === lang && state.draggingLineBottom['index'] === index
                      ? true
                      : false
                  "
                  :dragging-line-top="
                    state.draggingLineTop['lang'] === lang && state.draggingLineTop['index'] === index ? true : false
                  "
                  @delete="removeMultipleEntry(index, lang)"
                  @handleDragStart="handleDragStart(index, lang, $event)"
                  @handleDragOver="handleDragOver(index, lang, $event)"
                  @handleDrop="handleDrop(index, lang, $event)"
                >
                  <component
                    :is="is"
                    :value="val"
                    :index="index"
                    :lang="lang"
                    :name="name"
                    :bone="state.bonestructure"
                    @change="updateValue"
                    @keydown.enter="multipleBonePressEnter(lang)"
                  ></component>
                </wrapper-multiple>
              </div>

              <div
                v-else
                class="multiple-placeholder"
                :class="{ readonly: state.readonly }"
              >
                <sl-input
                  readonly
                  size="medium"
                  placeholder="Keine Einträge"
                ></sl-input>
              </div>

              <!--Bone Buttonbar -->
              <component
                :is="state.actionbar"
                v-if="!state.readonly"
                :value="state.bonevalue?.[lang]"
                :name="name"
                :lang="lang"
                @change="updateValue"
              ></component>
            </template>
            <!--Bone rendering for normal bones-->
            <component
              :is="is"
              v-else
              :value="state.bonevalue?.[lang]"
              :index="null"
              :lang="lang"
              :name="name"
              :bone="state.bonestructure"
              @change="updateValue"
            ></component>
          </sl-tab-panel>
        </template>
      </sl-tab-group>

      <template v-else>
        <!--Bone rendering for multiple bones-->
        <template v-if="state.multiple && !BoneHasMultipleHandling(state.bonestructure['type'])">
          <div
            v-for="(val, index) in state.bonevalue"
            v-if="state.bonevalue?.length"
            :key="index+'_'+state.bonevalue.length"
            class="multiple-bone"
          >

            <wrapper-multiple
              :readonly="!state.readonly"
              :is-dragging="state.isDragging.index === index ? true : false"
              :dragging-line-bottom="state.draggingLineBottom.index === index ? true : false"
              :dragging-line-top="state.draggingLineTop.index === index ? true : false"
              @delete="removeMultipleEntry(index)"
              @handleDragStart="handleDragStart(index, (lang = null), $event)"
              @handleDragOver="handleDragOver(index, (lang = null), $event)"
              @handleDrop="handleDrop(index, (lang = null), $event)"
            >
              <component
                :is="is"
                :value="val"
                :index="index"
                :name="name"
                :bone="state.bonestructure"
                @change="updateValue"
                @keydown.enter="multipleBonePressEnter()"
              ></component>
            </wrapper-multiple>
          </div>
          <div
            v-else
            class="multiple-placeholder"
          >
            <sl-input
              readonly
              size="medium"
              placeholder="Keine Einträge"
            ></sl-input>
          </div>
          <!--Bone Buttonbar -->
          <component
            :is="state.actionbar"
            v-if="!state.readonly"
            :value="state.bonevalue"
            :name="name"
            @change="updateValue"
          ></component>
        </template>
        <!--Bone rendering for normal bones-->

        <component
          :is="is"
          v-else
          :value="state.bonevalue"
          :name="name"
          :index="null"
          :bone="state.bonestructure"
          :autofocus="autofocus"
          @change="updateValue"
          @keypress.enter="updateValue"
        ></component>
      </template>

      <sl-alert
        v-for="message in state.errorMessages"
        open
        summary="Errors"
        variant="info"
      >
        <sl-icon
          slot="icon"
          name="exclamation-triangle"
        >
        </sl-icon>
        <div class="error-msg">
          {{ message }}
        </div>
      </sl-alert>
    </div>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
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

export default defineComponent({
  inheritAttrs: false,
  emits: ["change", "change-internal", "handleClick"],
  components: {
    wrapperMultiple,
    BoneLabel
  },
  props: {
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
        return ["normal","top","hide"].includes(value)
      }
    },
    showLabelInfo: { type: Boolean, required: false, default: false },
    autofocus: { type: Boolean, required: false, default: false }
  },

  setup(props, context) {
    const state: any = reactive({
      bonestructure: computed(() => {
        return props.structure?.[props.name]
      }),
      bonevalue: null,
      dragStartIndex: {
        lang: null,
        index: Number
      },
      dropIndex: {
        lang: null,
        index: Number
      },
      draggingLineBottom: {
        lang: String,
        index: Number
      },
      draggingLineTop: {
        lang: String,
        index: Number
      },
      isDragging: {
        lang: String,
        index: Number
      },
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
            error["fieldPath"].length===1 &&error["fieldPath"][0] === props.name &&
            (error["severity"] > 2 || (state.required && (error["severity"] === 2 || error["severity"] === 0)))
          ) {
            //severity level???
            errors.push(error["errorMessage"])
          }
        }
        return errors
      })
    })
    provide("boneState", state)

    // Handle drag start event
    function handleDragStart(index, lang, event) {
      setStateProperties(lang, index, "isDragging")
      setStateProperties(lang, index, "dragStartIndex")
    }

    // Handle drag over event
    function handleDragOver(index, lang, event) {
      event.preventDefault()

      const relativePosition = event.clientY - event.target.getBoundingClientRect().top
      const dragOverLine = event.target.closest(".value-line")

      if (relativePosition < dragOverLine.offsetHeight / 2) {
        setStateProperties(lang, index, "draggingLineTop")
        resetStateProperties("draggingLineBottom")
        state.dropIndex.index = index
      } else {
        setStateProperties(lang, index, "draggingLineBottom")
        resetStateProperties("draggingLineTop")
        state.dropIndex.index = index + 1
      }

      let allVals = lang ? state.bonevalue[lang] : state.bonevalue

      if (state.dropIndex.index > allVals.length - 1) {
        state.dropIndex.index -= 1
      }
    }
    // Handle drop event
    function handleDrop(index, lang, event) {
      let dragItem = null

      if (state.dragStartIndex.index !== state.dropIndex.index) {
        if (lang) {
          dragItem = state.bonevalue[lang].splice(state.dragStartIndex.index, 1)[0]
          state.bonevalue[lang].splice(state.dropIndex.index, 0, dragItem)
        } else {
          dragItem = state.bonevalue.splice(state.dragStartIndex.index, 1)[0]
          state.bonevalue.splice(state.dropIndex.index, 0, dragItem)
        }
      }

      if (lang){
        updateValue(props.name, state.bonevalue[lang], lang)
      }else{
        updateValue(props.name, state.bonevalue)
      }

      resetStateProperties("draggingLineBottom", "draggingLineTop", "isDragging", "dragStartIndex", "dropIndex")
    }

    // Set state properties based on lang and index
    function setStateProperties(lang, index, property) {
      state[property].lang = lang ? lang : null
      state[property].index = index
    }

    // Reset state properties to null values
    function resetStateProperties(...properties) {
      properties.forEach((property) => {
        state[property] = {
          lang: null,
          index: Number
        }
      })
    }

    function updateValue(
      name: string,
      val: any,
      lang: string | null = null,
      index: number | null = null,
      pwMatch?: boolean
    ) {
      if (val === undefined) return false
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
      } else if (pwMatch === false) {
        // do something; skip changing value on initial type
      } else {
        state.bonevalue = val
      }
      if (state.readonly) return false

      let changeObj = {
        name: name,
        value: "",
        lang: lang,
        index: index
      }

      let changeInternalObj = {
        name: name,
        value: val,
        lang: lang,
        index: index
      }

      if (pwMatch !== undefined && pwMatch !== null) {
        changeObj.pwMatch = pwMatch
        changeInternalObj.pwMatch = pwMatch
      }

      //context.emit("change", changeObj)
      context.emit("change-internal", changeInternalObj)
    }

    function toFormValue() {
      function rewriteData(val: any, key: string | null = null): Array<Object> {
        let ret = []
        if (Array.isArray(val)) {
          if (state.bonestructure["type"] == "spatial" && val.length === 2 && !Array.isArray(val[0])) {
            ret.push({ [key + ".lat"]: val[0] })
            ret.push({ [key + ".lng"]: val[1] })
          } else if (Object.values(val).filter((c) => c === Object(c)).length > 0) {
            //only add i if relationaldata
            for (const [i, v] of val.entries()) {
              if (v["rel"] !== null) {
                ret.push(rewriteData(v, key + "." + i)) // append idx if we have rel data
              } else {
                ret.push(rewriteData(v, key))
              }
            }
          } else {
            if (val.length===0){
              ret.push(rewriteData("", key))
            }else{
              for (const [i, v] of val.entries()) {
                ret.push(rewriteData(v, key))
              }
            }
          }
        } else if (val === Object(val)) {
          for (const [k, v] of Object.entries(val)) {
            if (key) {
              if (key.endsWith(".dest") || key.endsWith(".rel")) {
                if (key.endsWith(".dest") && k === "key") {
                  // if single bonename, multiple bonename, using single bonename.key, using multiple bonename.0.key
                  // if dest we only send the key
                  // we send key 2 times. this is ugly we need a better solution... or a better handling on server side

                  if (/\.[0-9]*\.dest$/.test(key)) {
                    ret.push(rewriteData(v, key.replace(/\.[0-9]*\.dest/, "")))
                  } else {
                    ret.push(rewriteData(v, key.replace(/\.dest/, "")))
                  }

                  ret.push(rewriteData(v, key.replace(/\.dest/, "") + "." + k))
                } else if (key.endsWith(".rel")) {
                  ret.push(rewriteData(v, key.replace(/\.rel/, "") + "." + k))
                }
              } else {
                ret.push(rewriteData(v, key + "." + k))
              }
            } else {
              ret.push(rewriteData(v, k))
            }
          }
        } else {
          if (val === null || val === undefined) {
            val = ""
          }
          if (key !== null) {
            ret.push({ [key]: val })
          }
        }
        return ret
      }

      let value = rewriteData(state.bonevalue, props.name)
      value = value.flat(10)
      return value
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

    function removeMultipleEntry(index: number, lang = null) {
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

    function multipleBonePressEnter(lang = null, data = "") {
      addMultipleEntry(lang, data)
    }

    function formatString(formatstr: string, boneValue: object | Array<object>) {
      function getpathListFromFormatstring(formatstr) {
        let output = []
        let formatList = []
        let regstr = /\$\((.*?)\)/g

        while (formatList) {
          formatList = regstr.exec(formatstr)
          if (!formatList) {
            formatList = false
            continue
          }

          output.push(formatList[1])
        }

        return output
      }

      function readValue(pathstr, avalue) {
        let path = pathstr.split(".")
        let restPath = pathstr.split(".")
        let aval = avalue
        for (let entry of path) {
          restPath.shift()
          if (aval && aval !== "-" && Object.keys(aval).includes(entry)) {
            if (Array.isArray(aval[entry])) {
              let resVal = []
              for (let val of aval[entry]) {
                resVal.push(readValue(restPath.join("."), val))
              }
              aval = resVal.join(", ")
            } else {
              aval = readValue(restPath.join("."), aval[entry])
            }
          } else if (!aval || (typeof aval[entry] === 'object' && !aval[entry])) {
            aval = "-"
          }
        }
        return aval
      }

      let pathlist = getpathListFromFormatstring(formatstr)

      let finalStrList = []

      if (!Array.isArray(boneValue)) {
        boneValue = [boneValue]
      }

      for (let avalue of boneValue) {
        let finalstr = formatstr
        for (let pathstr of pathlist) {
          let aval = readValue(pathstr, avalue)
          finalstr = finalstr.replace("$(" + pathstr + ")", aval)
        }
        finalStrList.push(finalstr)
      }
      return finalStrList.join(", ")
    }
    provide("formatString", formatString)

    onBeforeMount(() => {
      if (props.value) {
        state.bonevalue = props.value
      } else {
        state.bonevalue = props.skel?.[props.name]
      }
      //validateBoneValue()
    })

    watch(
      () => props.skel,
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

    return {
      state,
      updateValue,
      addMultipleEntry,
      removeMultipleEntry,
      removeMultipleEntries,
      BoneHasMultipleHandling,
      multipleBonePressEnter,
      handleDragStart,
      handleDragOver,
      handleDrop,
      setStateProperties,
      resetStateProperties
    }
  }
})
</script>

<style scoped>
.dragging-top {
  border-top: 2px solid var(--sl-color-neutral-400);
}

.dragging-bottom {
  border-bottom: 2px solid var(--sl-color-neutral-400);
}

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

      &:deep(sl-details){
        &:last-child{
          &::part(base){
            border-bottom: none;
          }
        }
      }

    }
  }

  &.label-hide{
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
  --track-width: 0;
  --indicator-color: var(--vi-background-color);
  --track-color: var(--vi-border-color);

  &::part(body) {
    padding-bottom: var(--sl-spacing-x-small);
    overflow-x: hidden;
  }

   &::part(tabs){
      border-top: 1px solid var(--vi-border-color);
   }

  & sl-tab {
    margin-top: -1px;

    &[aria-selected="true"]{
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
      transition: all ease .3s;
    }

    &:hover{
        &::part(base) {
          background-color: var(--vi-background-color);
          border: 1px solid var(--vi-border-color);
        }
     }

    &:first-child{
      &::part(base) {
         border-bottom-left-radius: 5px;
       }
     }

    &:nth-last-child(2){
      &::part(base) {
         border-bottom-right-radius: 5px;
       }
     }

    &:not(:first-child){
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
      &.dragging-line-top {
        margin-top: 0;
      }
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
</style>
