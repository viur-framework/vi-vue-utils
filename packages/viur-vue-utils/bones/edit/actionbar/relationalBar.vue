<template>
  <div class="actionbar">
    <sl-button
      v-if="boneState.multiple && !readonly"
      variant="danger"
      :title="$t('bone.del')"
      outline
      class="delete-btn"
      @click="openSelector()"
    >
      <sl-icon
        slot="prefix"
        name="x-lg"
      ></sl-icon>
    </sl-button>

    <sl-combobox
      :source="getList"
      hoist
      @sl-item-select="
        addMultipleEntry(lang, {
          dest: state.skels?.[$event.detail.item.value],
          rel: state.hasUsing ? undefined : null
        })
      "
    ></sl-combobox>

    <sl-button
      v-if="boneState.multiple && !readonly"
      variant="success"
      :title="$t('bone.add')"
      outline
      class="add-btn"
      @click="addMultiple"
    >
      <sl-icon
        slot="prefix"
        name="plus-lg"
      ></sl-icon>
      {{ $t("bone.addEmpty") }}
    </sl-button>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject, computed } from "vue"
import { Request } from "../../../index"

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String,
    readonly: Boolean,
    params: Object
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const addMultipleEntry = inject("addMultipleEntry")
    const formatString = inject("formatString")
    const removeMultipleEntries = null
    const state = reactive({
      skels: {},
      hasUsing: computed(() => boneState?.bonestructure["using"])
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
        //?viurTags$lk=${search.toLowerCase()}
        const data = await resp.json()
        state.skels = data["skellist"].reduce((acc, curr) => ((acc[curr["key"]] = curr), acc), {})

        return data["skellist"]?.map((d: any) => {
          return { text: formatString(boneState.bonestructure["format"], { dest: d }), value: d.key, data: d }
        })
      })
    }

    onMounted(() => {
      if (!props.value || props.value.length === 0) {
        context.emit("change", props.name, [], props.lang) //init
      }
    })

    function addMultiple(){
      let relDefault = null
      if (state.hasUsing) {
        relDefault = undefined
      }
      addMultipleEntry(props.lang, { dest: {}, rel: relDefault })
    }

    return {
      state,
      boneState,
      addMultipleEntry,
      addMultiple,
      removeMultipleEntries,
      getList
    }
  }
})
</script>

<style scoped>
.actionbar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

sl-combobox {
  width: 100%;
}

.delete-btn {
  margin-right: var(--sl-spacing-x-small);
}

.add-btn {
  margin-left: var(--sl-spacing-x-small);
}
</style>
