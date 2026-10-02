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
      <sl-icon slot="prefix" name="x-lg"></sl-icon>
    </sl-button>

    <sl-combobox
      :source="getList"
      hoist
      @sl-item-select="
        addMultipleEntry(lang, {
          dest: state.skels?.[$event.detail.item.value],
          rel: state.hasUsing ? undefined : null,
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
      <sl-icon slot="prefix" name="plus-lg"></sl-icon>
      {{ $t("bone.addEmpty") }}
    </sl-button>
  </div>
</template>

<script setup>
import { reactive, onMounted, inject, computed } from "vue"
import { Request } from "../../../index"

const props = defineProps({
  name: String,
  value: Object,
  index: Number,
  lang: String,
  readonly: Boolean,
  params: Object,
})

const emit = defineEmits(["change"])

const boneState = inject("boneState")
const addMultipleEntry = inject("addMultipleEntry")
const formatString = inject("formatString")
const removeMultipleEntries = null
const state = reactive({
  skels: {},
  hasUsing: computed(() => boneState?.bonestructure["using"]),
})

function getList(search) {
  let params = ""
  if (boneState.bonestructure["type"].startsWith("relational.tree.leaf")) {
    params = "skelType=leaf&"
  } else if (boneState.bonestructure["type"].startsWith("relational.tree.node")) {
    params = "skelType=node&"
  }
  return Request.get(
    `/${import.meta.env.VITE_DEFAULT_RENDERER || "vi"}/${boneState.bonestructure["module"]}/list?${params}limit=99`
  ).then(async (resp) => {
    //?viurTags$lk=${search.toLowerCase()}
    const data = await resp.json()
    state.skels = data["skellist"].reduce((acc, curr) => ((acc[curr["key"]] = curr), acc), {})

    return data["skellist"]?.map((d) => {
      return { text: formatString(boneState.bonestructure["format"], { dest: d }), value: d.key, data: d }
    })
  })
}

onMounted(() => {
  if (!props.value || props.value.length === 0) {
    emit("change", props.name, [], props.lang) //init
  }
})

function addMultiple() {
  let relDefault = null
  if (state.hasUsing) {
    relDefault = undefined
  }
  addMultipleEntry(props.lang, { dest: {}, rel: relDefault })
}
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
