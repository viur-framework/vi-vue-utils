<template>
  <div
    class="wrapper-multiple widget-bone widget-bone-select widget-bone-select-choose"
    :class="([`widget-bone-select-${name}`])"

  v-if="boneState['bonestructure']['multiple']">
    <sl-checkbox v-for="value in convertObjToList()"
                :data-value="value[0]"
                :checked="state.value.includes(value[0])"
                :disabled="boneState.readonly"
                @sl-change="changeEventMultiple"
                 :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
    >
      {{ value[1] }}
    </sl-checkbox>
  </div>

  <sl-radio-group v-else :value="state.value" @sl-change="changeEvent"
    class="widget-bone widget-bone-select widget-bone-select-choose"
    :class="([`widget-bone-select-${name}`])"
  >
    <sl-radio v-for="value in convertObjToList()" :value="value[0]" :disabled="boneState.readonly" :data-user-invalid="boneState.errorMessages.length===0?undefined:true">
      {{ value[1] }}
    </sl-radio>
  </sl-radio-group>
</template>

<script setup>

import { reactive, onMounted, inject, computed } from "vue"
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

    function changeEventMultiple(event){
      let currentValue = [...state.value]
      if (event.target.checked){
        currentValue.push(event.target.dataset['value'])
      }else{
        currentValue = currentValue.filter(x=>x !== event.target.dataset['value'])
      }
      emit("change", props.name, currentValue, props.lang, props.index)
    }

    function changeEvent(event) {
      emit("change", props.name, event.target.value, props.lang, props.index)
    }

    onMounted(() => {
      emit("change", props.name, state.value, props.lang, props.index) //init
    })

</script>

<style scoped>
.wrapper-multiple{
  display:flex;
  flex-direction: column;
}

sl-checkbox::part(control--checked) {
  background-color: var(--sl-color-success-600);
  border: 1px solid var(--sl-color-primary-600);
}
sl-checkbox::part(control--indeterminate) {
  background-color: var(--sl-color-success-600);
  border: 1px solid var(--sl-color-success-600);
}
</style>
