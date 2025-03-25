<template>
  <div
    class="record widget-bone widget-bone-relational widget-bone-relational-select"
    :class="([`widget-bone-relational-${name}`])"
  >
    <div class="single-entry">
      <sl-select
        :disabled="boneState.readonly"
        :value="state.selection?.['dest']['key']"
        hoist
        max-options-visible="0"
        clearable
        :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.languages"
        @sl-change="changeEvent"
        :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
        :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
      >
        <sl-option
          v-for="(obj,key) in state.skellistdata"
          :key="key"
          :value="key"
        >
          {{ formatString(state.format, obj) }}
        </sl-option>
      </sl-select>
    </div>
    <Wrapper_nested
      v-if="bone['using']"
      :value="value"
      :name="name"
      :index="index"
      :bone="bone"
      :disabled="bone['readonly']"
      @change="changeEventNested"
    >
    </Wrapper_nested>
  </div>
</template>

<script setup>
import { reactive, onMounted, inject, computed } from "vue"
import { Request } from "../../connection/request"
import Wrapper_nested from "../wrapper_nested.vue"
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

  const emit = defineEmits( ["change"])

    const boneState = inject("boneState")
    const formatString = inject("formatString")
    const state = reactive({
      format: computed(() => {
        return boneState?.bonestructure["format"]
      }),
      skellistdata: null,
      selection: null
    })

    function getList(search) {
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

        return data["skellist"]?.map((d) => {
          return { text: formatString(boneState.bonestructure["format"], { dest: d }), value: d.key, data: d }
        })
      })
    }

    function changeEvent(event) {
      state.selection = { dest: state.skellistdata[event.target.value] }
      emit("change", props.name, state.selection, props.lang, props.index)
    }

    function changeEventNested(data) {
      state.selection = {...state.selection, "rel":data["value"]}
      emit("change", data["name"], state.selection , data["lang"], data["index"])
    }

    onMounted(() => {
      state.selection = props.value
      getList()
      emit("change", props.name, props.value, props.lang, props.index) //init
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
sl-select {
  width: 100%;

  &::part(combobox) {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }

  @media (max-width: 900px) {
    &::part(combobox) {
      border-top-right-radius: 0;
      border-bottom-left-radius: var(--sl-border-radius-medium);
    }
  }
}

sl-option {
  &::part(base) {
    transition: background-color ease 0.3s;
  }

  &:hover {
    &::part(base) {
      background-color: var(--sl-color-gray-200);
    }
  }
}
</style>
