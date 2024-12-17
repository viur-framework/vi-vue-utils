<template>
  <div
    class="record widget-bone widget-bone-relational widget-bone-relational-default"
    :class="([`widget-bone-relational-${name}`])"
  >
    <div class="single-entry">
      <sl-input
        v-if="state.selection?.['dest']?.['key']"
        :disabled="true"
        :value="value ? formatString(state.format, state.selection) : ''"
      ></sl-input>
      <sl-combobox
        v-else
        :disabled="boneState.readonly"
        :source="getList"
        hoist
        @sl-item-select="changeEvent"
        :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
        :data-invalid="boneState.errorMessages.length===0?undefined:true"
      ></sl-combobox>

      <sl-button
        v-if="!boneState.multiple && !boneState.isEmpty"
        variant="danger"
        outline
        :title="$t('bone.del')"
        class="delete-btn square-btn"
        @click="
          () => {
            $emit('change', name, '', lang, index)
            state.selection = null
          }
        "
      >
        <sl-icon
          slot="prefix"
          name="x-lg"
        ></sl-icon>
      </sl-button>
    </div>
    <Wrapper_nested
      v-if="bone['using']"
      :value="value?.['rel']"
      :name="name"
      :index="index"
      :lang="lang"
      :bone="bone"
      :disabled="bone['readonly']"
      @change="changeEventNested"
    >
    </Wrapper_nested>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, computed } from "vue"
import { Request } from "../../../index"
import Wrapper_nested from "../wrapper_nested.vue"

export default defineComponent({
  inheritAttrs: false,
  props: {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    bone: Object,
  },
  components: { Wrapper_nested },
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const formatString = inject("formatString")
    const state = reactive({
      format: computed(() => {
        return boneState?.bonestructure["format"]
      }),
      skellistdata: null,
      selection: null,
      relationalData:null
    })

    function getList(search: String) {
      let params = ""
      if (boneState.bonestructure["type"] === "relational.tree.leaf.file") {
        params = "skelType=leaf&"
      } else if (boneState.bonestructure["type"] === "relational.tree.node.file") {
        params = "skelType=node&"
      }

      return Request.get(
        `/${import.meta.env.VITE_DEFAULT_RENDERER || "vi"}/${boneState.bonestructure["module"]}/list?${params}limit=99`
      ).then(async (resp) => {
        //?viurTags$lk=${search.toLowerCase()
        const data = await resp.json()

        state.skellistdata = {}
        for (let e of data["skellist"]) {
          state.skellistdata[e["key"]] = e
        }

        return data["skellist"]?.map((d: any) => {
          return { text: formatString(boneState.bonestructure["format"], { dest: d }), value: d.key, data: d }
        })
      })
    }

    function changeEvent(event) {
      state.selection = { dest: state.skellistdata[event.detail.item.value] }
      if (props.bone["using"] && state.relationalData){
        state.selection = {...state.selection, "rel":state.relationalData}
      }
      context.emit("change", props.name, state.selection, props.lang, props.index)
    }

    function changeEventNested(data) {
      state.relationalData = data["value"]
      if (state.selection?.dest){ // only send a change if we have a valid target
        state.selection = {...state.selection, "rel":data["value"]}
        context.emit("change", data["name"], state.selection, data["lang"], data["index"])
      }
    }

    onMounted(() => {
      state.selection = props.value
      context.emit("change", props.name, props.value, props.lang, props.index) //init
    })

    return {
      state,
      boneState,
      formatString,
      changeEvent,
      changeEventNested,
      getList
    }
  }
})
</script>

<style scoped>
.single-entry {
  display: flex;
  gap: var(--sl-spacing-x-small);

  :deep(sl-combobox) {
    &::part(input__base) {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }
}

sl-input {
  width: 100%;

  &::part(base) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  &::part(base) {
    background-color: var(--sl-color-neutral-0);
  }
}
sl-combobox {
  width: 100%;

  &::part(input) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;

    & :deep(&::part(base)) {
      border: 1px solid red;
    }
  }
}
</style>
