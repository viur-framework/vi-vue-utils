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
      <sl-icon name="x"></sl-icon>
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
      @click="addMultipleEntry(lang)"
    >
      <sl-icon name="plus"></sl-icon> {{ $t("bone.list") }}
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

    return {
      state,
      boneState,
      addMultipleEntry,
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

  &::part(base) {
    aspect-ratio: 1;
  }
}

.add-btn {
  margin-left: var(--sl-spacing-x-small);

  & sl-icon {
    margin-right: var(--sl-spacing-x-small);
  }
}
</style>
