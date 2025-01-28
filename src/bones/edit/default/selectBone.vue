<template>
  <sl-select
    class="widget-bone widget-bone-select widget-bone-select-default"
    :class="([`widget-bone-select-${name}`])"
    :name="name"
    :disabled="boneState.readonly"
    :value="state.value"
    hoist
    :multiple="boneState['bonestructure']['multiple']"
    max-options-visible="0"
    clearable
    @sl-change="changeEvent"
    :placeholder="boneState.label==='placeholder'?boneState?.bonestructure?.descr:undefined"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  >
    <sl-option
      v-for="value in convertObjToList()"
      :key="value[0]"
      :value="value[0]"
    >
      {{ value[1] }}
    </sl-option>
  </sl-select>
</template>

<script setup>

import {reactive, onMounted, inject, computed} from "vue"
  defineOptions({
    inheritAttrs: false
  })
  const props = defineProps( {
    name: String,
    value: null,
    index: Number,
    lang: String,
    bone:Object,
    autofocus: Boolean
  })

  const emit = defineEmits( ["change"])

    const boneState = inject("boneState")
    const state = reactive({
      value: computed(() => {
        let val = props.value
        if (Array.isArray(props.value)) {
          if (boneState["bonestructure"]["values"] instanceof Array) {
            val = val.filter((i) => boneState["bonestructure"]["values"].map((i) => i[0].toString()).includes(i))
          } else
            val = val.filter((i) =>
              Object.keys(boneState["bonestructure"]["values"])
                .map((i) => i.toString())
                .includes(i)
            )

          return val.map((i) => i.toString())
        }
        return props.value ? props.value.toString() : ""
      })
    })

    function convertObjToList() {
      if (Array.isArray(boneState["bonestructure"]["values"])) {
        return boneState["bonestructure"]["values"]
      } else {
        let objToList = []
        for (const [key, value] of Object.entries(boneState["bonestructure"]["values"])) {
          objToList.push([key, value])
        }
        return objToList
      }
    }

    function changeEvent(event) {
      emit("change", props.name, event.target.value, props.lang, props.index)
    }

    onMounted(() => {
      emit("change", props.name, state.value, props.lang, props.index) //init
    })


</script>

<style scoped>
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
