<template>
  <div class="record">
    <div class="single-entry">
      <sl-input
        v-if="state.selection"
        :disabled="true"
        :value="value ? formatString(state.format, state.selection) : ''"
      ></sl-input>
      <sl-combobox
        v-else
        :disabled="boneState.readonly"
        :source="getList"
        hoist
        @sl-item-select="changeEvent"
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
      v-if="boneState?.bonestructure['using']"
      :value="value?.['rel']"
      :name="name"
      :index="index"
      :disabled="boneState.bonestructure['readonly']"
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
    lang: String
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
      selection: null
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
      context.emit("change", props.name, state.selection, props.lang, props.index)
    }

    function changeEventNested(val) {
      if (!state.selection) state.selection = {}

      if (!state.selection["rel"]?.[val.name]) {
        if (!state.selection["rel"]) {
          state.selection["rel"] = { [val.name]: null }
        } else {
          state.selection["rel"][val.name] = null
        }
      }

      let currentBone = state.selection["rel"][val.name]
      if (val.lang) {
        if (currentBone === null) currentBone = {}
        if (Object.keys(currentBone).includes(val.lang) && val.index !== null) {
          currentBone[val.lang][val.index] = val.value
        } else {
          currentBone[val.lang] = val.value
        }
      } else if (val.index !== null) {
        if (currentBone === null) currentBone = []
        currentBone[val.index] = val.value
      } else {
        currentBone = val.value
      }

      if (Object.keys(state.selection).includes("rel") && state.selection["rel"]) {
        state.selection["rel"][val.name] = currentBone
      } else {
        state.selection["rel"] = { [val.name]: currentBone }
      }

      if (!Object.keys(state.selection).includes("dest")) return
      context.emit("change", props.name, state.selection, props.lang, props.index)
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
