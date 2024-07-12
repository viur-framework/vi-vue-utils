<template>
  <div class="box">
    <!--<vue-json-pretty
      :deep="0"
      :data="value"
      @selectedChange="changeEvent"
    ></vue-json-pretty>-->
    {{ value }}
  </div>
</template>

<script setup>
import { reactive, useAttrs, onMounted, inject } from "vue"
//import { VueJsonPretty } from "vue-json-pretty"
//import "vue-json-pretty/lib/styles.css"

const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String,
  readonly: Boolean,
  params: Object
})

const emit = defineEmits(["change"])
const attrs = useAttrs() // This hook collects all attributes that are not props

const boneState = inject("boneState")

const state = reactive({})

function changeEvent(newVal, oldVal) {
  emit("change", props.name, newVal, props.lang, props.index)
}

onMounted(() => {
  emit("change", props.name, props.value, props.lang, props.index) //init
})
</script>

<style scoped>
.box {
  width: 100%;
  border: 1px solid var(--sl-color-gray-500);
  border-radius: 5px;
  min-height: 40px;
}
</style>
