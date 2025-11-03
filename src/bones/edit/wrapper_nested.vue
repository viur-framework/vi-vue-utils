<template>
  <sl-alert v-if="!state.globalRegistration" open variant="danger">
    In Order to use this Bone register the bone component globally in your main file
  </sl-alert>
  <div v-else class="form">
    <sl-spinner v-if="state.updating" style="position: absolute; top: 20px; left: -10px"></sl-spinner>
    <vi-form
      ref="skelRef"
      :internal="mainformState"
      :skel="value"
      :structure="bone['using']"
      :renderer="state.renderer"
      :collapsed-categories="
        state.isLastEntry ? [] : bone?.params?.['collapsedCategories'] ? bone?.params?.['collapsedCategories'] : []
      "
      :readonly="mainformState.readonly"
      @change="changeEvent"
    ></vi-form>
  </div>
</template>

<script setup>
import { reactive, defineComponent, onMounted, inject, computed, getCurrentInstance, watch, ref } from "vue"
import { getBoneWidget } from "./index"
import ViForm from "../../forms/ViForm.vue"
import { useTimeoutFn } from "@vueuse/core"

const emit = defineEmits(["change"])
const props = defineProps({
  name: String,
  value: null,
  index: Number,
  lang: String,
  readonly: Boolean,
  params: Object,
  bone: Object,
})
const skelRef = ref(null)
const boneState = inject("boneState")
const mainformState = inject("mainformState")
const state = reactive({
  renderer: import.meta.env.VITE_DEFAULT_RENDERER || "json",
  globalRegistration: false,
  isLastEntry: computed(() => {
    if (!props.bone["multiple"]) return false

    let val = mainformState.skel[props.name]
    if (props.lang) {
      val = mainformState.skel[props.name][props.lang]
    }
    if (!val) {
      return false
    }
    return val.length - 1 === props.index
  }),
  updating: false,
})

function changeEvent(val) {
  state.updating = true
  val["value"] = skelRef.value.state.skel // send whole form
  val["name"] = props.name
  val["index"] = props.index
  val["lang"] = props.lang
  emit("change", val)
  useTimeoutFn(() => {
    state.updating = false
  }, 1000)
}

watch(
  () => props.value,
  (newVal, oldVal) => {
    state.updating = false
  }
)

onMounted(() => {
  let app = getCurrentInstance().appContext
  if (app.components.Bone) {
    state.globalRegistration = true
  } else {
    state.globalRegistration = false
  }

  let val = {}
  if (props.value) val = props.value

  for (const [bonename, boneStructure] of Object.entries(props.bone["using"])) {
    if (!Object.keys(val).includes(bonename) && boneStructure["defaultvalue"]) {
      val[bonename] = boneStructure["defaultvalue"]
    }
  }

  emit("change", props.name, val, props.lang, props.index) //init
})
</script>

<style scoped>
.form {
  width: 100%;
  position: relative;
}
</style>
