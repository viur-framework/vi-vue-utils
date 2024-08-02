<template>
  <Wrapper_nested
    :value="value"
    :name="name"
    :index="index"
    :lang="lang"
    :bone="bone"
    :disabled="bone['readonly']"
    @change="changeEvent"
  >
  </Wrapper_nested>
</template>

<script setup>
import { reactive, defineComponent, onMounted, inject, computed, getCurrentInstance } from "vue"
import Wrapper_nested from "../wrapper_nested.vue"


const emit = defineEmits(["change"])
const props = defineProps({
    name: String,
    value: null,
    index: Number,
    lang: String,
    bone:Object
  })

const state = reactive({})

function changeEvent(data) {
  emit("change", data["name"], data["value"], data["lang"], data["index"])
}

onMounted(() => {
  emit("change", props.name, props.value, props.lang, props.index) //init
})

</script>

<style scoped>
sl-input {
  width: 100%;
}
</style>
