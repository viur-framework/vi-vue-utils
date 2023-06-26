<template>
  <div
    class="bone-wrapper"
    :class="'bone-wrapper-' + state.bonestructure['type']"
  >
    <bone-label>
      <span :class="{ required: state.required }">{{ state.bonestructure["descr"] }}</span>
      <span v-if="state.required" class="required"> *</span>
      <sl-tooltip
        v-if="state.hasTooltip"
        :content="state.bonestructure.params['tooltip']"
        placement="top-center"
      >
        <div class="tooltip">
          <sl-icon name="question"></sl-icon>
        </div>
      </sl-tooltip>
    </bone-label>
    <div class="bone-inner-wrap">
      <!--Language chooser -->
      <sl-tab-group
        class="lang-tab"
        v-if="state.multilanguage"
        placement="bottom"
      >
        <template v-for="lang in state.languages" :key="lang + '_tab'">
          <sl-tab slot="nav" :panel="'lang_' + lang">
            {{ $t(lang) }}
          </sl-tab>

          <sl-tab-panel :name="'lang_' + lang">
            <!--Bone rendering for multiple bones-->
            <template
              v-if="
                state.multiple &&
                !BoneHasMultipleHandling(state.bonestructure['type'])
              "
            >
              <!--multilang and multiple-->
              <div
                class="multiple-bone"
                v-if="state.bonevalue?.[lang].length"
                v-for="(val, index) in state.bonevalue?.[lang]"
                :key="index"
              >
                <wrapper-multiple
                  :readonly="!state.readonly"
                  @delete="removeMultipleEntry(index, lang)"
                >
                  <component
                    :is="is"
                    :value="val"
                    :index="index"
                    :lang="lang"
                    :name="name"
                    @change="updateValue"
                    @keydown.enter="multipleBonePressEnter(lang)"
                  ></component>
                </wrapper-multiple>
              </div>

              <div
                class="multiple-placeholder"
                :class="{ readonly: state.readonly }"
                v-else
              >
                <sl-input
                  readonly
                  size="medium"
                  placeholder="Keine Einträge"
                ></sl-input>
              </div>

              <!--Bone Buttonbar -->
              <component
                v-if="!state.readonly"
                :is="state.actionbar"
                :lang="lang"
              ></component>
            </template>
            <!--Bone rendering for normal bones-->
            <component
              v-else
              :is="is"
              :value="state.bonevalue?.[lang]"
              :index="null"
              :lang="lang"
              :name="name"
              @change="updateValue"
            ></component>
          </sl-tab-panel>
        </template>
      </sl-tab-group>

      <template v-else>
        <!--Bone rendering for multiple bones-->
        <template
          v-if="
            state.multiple &&
            !BoneHasMultipleHandling(state.bonestructure['type'])
          "
        >
          <div
            class="multiple-bone"
            v-if="state.bonevalue?.length"
            v-for="(val, index) in state.bonevalue"
            :key="index"
          >
            <wrapper-multiple
              :readonly="!state.readonly"
              @delete="removeMultipleEntry(index)"
            >
              <component
                :is="is"
                :value="val"
                :index="index"
                :name="name"
                @change="updateValue"
                @keydown.enter="multipleBonePressEnter()"
              ></component>
            </wrapper-multiple>
          </div>
          <div class="multiple-placeholder" v-else>
            <sl-input
              readonly
              size="medium"
              placeholder="Keine Einträge"
            ></sl-input>
          </div>
          <!--Bone Buttonbar -->
          <component v-if="!state.readonly" :is="state.actionbar"></component>
        </template>
        <!--Bone rendering for normal bones-->
        <component
          v-else
          :is="is"
          :value="state.bonevalue"
          :name="name"
          :index="null"
          @change="updateValue"
        ></component>
      </template>

      <sl-alert
        open
        summary="Errors"
        variant="info"
        v-for="message in state.errorMessages"
      >
        <sl-icon name="exclamation-triangle" slot="icon"> </sl-icon>
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
} from "vue";
import wrapperMultiple from "./wrapper_multiple.vue";
import BoneLabel from "./boneLabel.vue";
import { BoneHasMultipleHandling, getBoneActionbar } from "./index";
import rawBone from "./default/rawBone.vue";

export default defineComponent({
  components: {
    wrapperMultiple,
    BoneLabel
  },
  props: {
    is: {
      type: Object,
      default: rawBone,
    },
    name: {
      type: String,
      required: true,
    },
    languages: Array,
    multiple: Boolean,
    readonly: Boolean,
    required: Boolean,
    params: Object,
    value: Object,
    structure: {
      type: Object,
      required: true,
    },
    skel: {
      type: Object,
      required: true,
    },
    errors: Object,
  },
  emits: ["change"],
  setup(props, context) {
    const state: any = reactive({
      bonestructure: computed(() => {
        return props.structure?.[props.name];
      }),
      bonevalue: null,
      multilanguage: computed(
        () => state.languages?.length && state.languages.length > 0
      ),
      languages: computed(() => {
        if (props.languages) {
          return props.languages;
        }
        return state.bonestructure &&
          Object.keys(state.bonestructure).includes("languages")
          ? state.bonestructure["languages"]
          : [];
      }),
      readonly: computed(() => {
        if (props.readonly) {
          return props.readonly;
        }
        return state.bonestructure &&
          Object.keys(state.bonestructure).includes("readonly")
          ? state.bonestructure["readonly"]
          : false;
      }),
      required: computed(() => {
        if (props.required) {
          return props.required;
        }
        return state.bonestructure &&
          Object.keys(state.bonestructure).includes("required")
          ? state.bonestructure["required"]
          : false;
      }),
      hasTooltip: computed(() => {
        return state.bonestructure &&
          Object.keys(state.bonestructure["params"]).includes("tooltip")
          ? true
          : false;
      }),

      multiple: computed(() => {
        if (props.multiple) {
          return props.multiple;
        }
        return state.bonestructure &&
          Object.keys(state.bonestructure).includes("multiple")
          ? state.bonestructure["multiple"]
          : false;
      }),
      params: computed(() => {
        if (props.params) {
          return props.params;
        }
        return state.bonestructure &&
          Object.keys(state.bonestructure).includes("params")
          ? state.bonestructure["params"]
          : {};
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
                return false;
              } else if (!Array.isArray(value)) {
                return false;
              }
            }
          }
          return true;
        }

        // Ignore the computation when the state is readonly
        if (state.readonly) return false;

        // Check for null or undefined values
        if (!state.bonevalue) return true;

        // Check if the value is an array with elements
        if (Array.isArray(state.bonevalue) && state.bonevalue.length > 0)
          return false;

        // Check if the value is an object and not an array, then use helper function to check if it's empty
        if (
          state.bonevalue === Object(state.bonevalue) &&
          !Array.isArray(state.bonevalue)
        )
          return isObjectEmpty(state.bonevalue);

        return false;
      }),

      errors: computed(() => {
        console.log("computed errors");
        return props.errors;
      }),
      errorMessages: computed(() => {
        let errors = [];
        for (let error of props.errors) {
          if (
            error["fieldPath"][0] === props.name &&
            (error["severity"] > 2 || (state.required && state.isEmpty))
          ) {
            //severity level???
            errors.push(error["errorMessage"]);
          }
        }
        return errors;
      }),
    });
    provide("boneState", state);

    function updateValue(
      name: string,
      val: any,
      lang: string | null = null,
      index: number = 0
    ) {
      if (val === undefined) return false;
      if (lang) {
        if (Object.keys(state.bonevalue).includes(lang) && index !== null) {
          state.bonevalue[lang][index] = val;
        } else {
          state.bonevalue[lang] = val;
        }
      } else if (index !== null) {
        state.bonevalue[index] = val;
      } else {
        state.bonevalue = val;
      }
      if (state.readonly) return false;

      context.emit("change", {
        name: name,
        value: toFormValue(),
        lang: lang,
        index: index,
      });
      context.emit("change-internal", {name:name, value:val,lang:lang,index:index})
    }

    function toFormValue() {
      function rewriteData(val: any, key: string | null = null): Array<Object> {
        let ret = [];
        if (Array.isArray(val)) {
          if (Object.values(val).filter((c) => c === Object(c)).length > 0) {
            //only add i if relationaldata
            for (const [i, v] of val.entries()) {
              ret.push(rewriteData(v, key + "." + i));
            }
          } else {
            for (const [i, v] of val.entries()) {
              ret.push(rewriteData(v, key));
            }
          }
        } else if (val === Object(val)) {
          for (const [k, v] of Object.entries(val)) {
            if (key) {
              if (key.endsWith("dest") && k === "key") {
                if (Object.keys(state.bonestructure).includes('using') && state.bonestructure['using']) {
                  ret.push(
                    rewriteData(
                      v,
                      key.replace(/\.[0-9]*\.dest/, "").replace(/\.dest/, "")+"."+k
                    )
                  );
                }else{
                  ret.push(
                    rewriteData(
                      v,
                      key.replace(/\.[0-9]*\.dest/, "").replace(/\.dest/, "")
                    )
                  );
                }
              } else if (key.endsWith("rel")) {
                ret.push(
                    rewriteData(
                      v,
                      key.replace(/\.[0-9]*\.rel/, "").replace(/\.rel/, "")+"."+k
                    )
                  );
              } else if (!key.endsWith("dest")) {
                ret.push(rewriteData(v, key + "." + k));
              }
            } else {
              ret.push(rewriteData(v, k));
            }
          }
        } else {
          if (val === null) {
            val = "";
          }
          if (key !== null) {
            ret.push({ [key]: val });
          }
        }
        return ret;
      }
      let value = rewriteData(state.bonevalue, props.name);
      value = value.flat(10);
      return value;
    }

    function addMultipleEntry(lang = null, data = "") {
      if (lang) {
        if (Object.keys(state.bonevalue).includes(lang)) {
          state.bonevalue[lang].push(data);
        } else {
          state.bonevalue[lang] = [data];
        }
      } else {
        if (state.bonevalue) {
          state.bonevalue.push(data);
        } else {
          state.bonevalue = [data];
        }
      }
    }
    provide("addMultipleEntry", addMultipleEntry);

    function removeMultipleEntry(index: number, lang = null) {
      if (lang) {
        state.bonevalue?.[lang].splice(index, 1);
      } else {
        state.bonevalue.splice(index, 1);
      }
      context.emit("change", {
        name: props.name,
        value: toFormValue(),
        lang: lang,
        index: index,
      });
      context.emit("change-internal", {name:props.name, value:val,lang:lang,index:index})
    }

    function removeMultipleEntries(lang = null) {
      if (lang) {
        state.bonevalue?.[lang].splice(0);
      } else {
        state.bonevalue.splice(0);
      }
      context.emit("change", {
        name: props.name,
        value: toFormValue(),
        lang: lang,
      });
      context.emit("change-internal", {name:props.name, value:toFormValue(),lang:lang})
    }

    provide("removeMultipleEntries", removeMultipleEntries);

    function multipleBonePressEnter(lang = null, data = "") {
      addMultipleEntry(lang, data);
    }

    function formatString(
      formatstr: string,
      boneValue: object | Array<object>
    ) {
      function getpathListFromFormatstring(formatstr) {
        let output = [];
        let formatList = [];
        let regstr = /\$\((.*?)\)/g;

        while (formatList) {
          formatList = regstr.exec(formatstr);
          if (!formatList) {
            formatList = false;
            continue;
          }

          output.push(formatList[1]);
        }

        return output;
      }

      let pathlist = getpathListFromFormatstring(formatstr);

      let finalStrList = [];
      if (!Array.isArray(boneValue)) {
        boneValue = [boneValue];
      }
      for (let avalue of boneValue) {
        let finalstr = formatstr;
        for (let pathstr of pathlist) {
          let path = pathstr.split(".");
          let aval = avalue;
          for (let entry of path) {
            if (aval && aval !== "-" && entry in aval && aval[entry]) {
              aval = aval[entry];
            } else {
              aval = "-";
            }
          }
          finalstr = finalstr.replace("$(" + pathstr + ")", aval);
        }
        finalStrList.push(finalstr);
      }

      return finalStrList.join(", ");
    }
    provide("formatString", formatString);

    onBeforeMount(() => {
      if (props.value) {
        state.bonevalue = props.value;
      } else {
        state.bonevalue = props.skel?.[props.name];
      }
      //validateBoneValue()
    });

    return {
      state,
      updateValue,
      addMultipleEntry,
      removeMultipleEntry,
      removeMultipleEntries,
      BoneHasMultipleHandling,
      multipleBonePressEnter,
    };
  },
});
</script>

<style scoped lang="less">
.bone-wrapper {
  display: grid;
  grid-template-columns: 230px 1fr;
  margin-bottom: 20px;

  &.bone-wrapper-record {
    display: flex;
    flex-direction: column;

    & > :deep(.bone-name) {
      border-bottom-left-radius: 0;
      border-top-right-radius: var(--sl-border-radius-medium);
    }

    & > .bone-inner-wrap {
      padding-top: var(--sl-spacing-small);
      border-top: 2px solid var(--sl-color-neutral-200);
    }

    .multiple-bone {
      border-bottom: 1px solid var(--sl-color-neutral-200);
      padding-bottom: var(--sl-spacing-2x-small);
      margin-bottom: var(--sl-spacing-small);
    }
  }

  @media (max-width: 900px){
    grid-template-columns: 1fr;
  }
}

sl-tab-panel::part(base) {
  padding: 0;
}

.lang-tab {
  &::part(body) {
    padding-bottom: var(--sl-spacing-x-small);
    overflow-x: hidden;
  }

  sl-tab {
    &::part(base) {
      padding: var(--sl-spacing-x-small);
    }
  }
}

.multiple-placeholder {
  &:not(.readonly) {
    margin-bottom: var(--sl-spacing-x-small);
  }

  sl-input {
    &::part(base) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      opacity: 0.7;
    }
  }

  @media (max-width: 900px){
    sl-input {
      &::part(base) {
        border-top-right-radius: 0;
        border-bottom-left-radius: var(--sl-border-radius-medium);
      }
    }
  }
}

.multiple-bone {
  margin-bottom: var(--sl-spacing-x-small);

  .bone-wrapper {
    margin-bottom: var(--sl-spacing-x-small);
  }
}

.bone-inner-wrap {
  min-width: 1px;

  sl-alert {
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

.tooltip {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  padding-left: .4em;

  sl-icon {
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


</style>
