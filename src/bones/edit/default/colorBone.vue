<template>
  <sl-color-picker
    class="widget-bone widget-bone-color widget-bone-color-default"
    :class="([`widget-bone-color-${name}`])"
    :disabled="boneState.readonly"
    :value="value"
    :required="boneState.bonestructure.required && !boneState.bonestructure.multiple  && !boneState.bonestructure.language"
    @sl-change="changeEvent"
    :data-user-invalid="boneState.errorMessages.length===0?undefined:true"
  ></sl-color-picker>
</template>

<script setup>
import { reactive, onMounted, inject } from "vue"
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
    const state = reactive({})

    function changeEvent(event) {
      emit("change", props.name, event.target.value, props.lang, props.index)
    }

    onMounted(() => {
      emit("change", props.name, props.value, props.lang, props.index) //init
    })
</script>

<style scoped>
sl-color-picker {
  &::part(trigger) {
    border-radius: 0;
  }
}
</style>
