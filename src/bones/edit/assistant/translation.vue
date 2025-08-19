<template>
  <div class="translate-wrapper">
    <div class="translate-grid">
      <div class="translate-flex">
        <sl-textarea :value="state.value_de" label="Original Sprache (de):" @sl-change="updateValueDe"></sl-textarea>
      </div>

      <div class="translate-icon-wrap">
        <sl-icon name="arrow-left-right"></sl-icon>
      </div>

      <div class="translate-flex">
        <sl-textarea
          :value="state.result || '-'"
          :label="`Zielsprache (` + state.currentLang + `):`"
          @sl-change="updateValue"
        ></sl-textarea>
      </div>
    </div>

    <div class="translate-footer">
      <span class="translate-small-print">
        * Bei der Übersetzung kommt künstliche Intelligenz zum Einsatz. Die Ergebnisse können daher fehlerhaft sein.
        Bitte prüfen Sie daher stets das Ergebnis.
      </span>
      <div></div>
      <sl-button size="small" variant="info" :loading="state.loading" @click="translate">Übersetzen</sl-button>
    </div>
  </div>

  <div slot="footer" class="translate-dialog-footer">
    <sl-button variant="danger" size="small" outline @click="CloseAction">{{ $t("relation.abort") }}</sl-button>

    <div class="translate-dialog-footer-spacer"></div>

    <sl-button variant="success" outline size="small" :disabled="!state.nextlang" @click="nextlang">
      Übernehmen und nächste leere Sprache
    </sl-button>

    <sl-button variant="success" size="small" @click="ApplySelection">
      Ziel für {{ state.currentLang }} übernehmen
    </sl-button>
  </div>
</template>

<script setup>
import { reactive, defineComponent, onMounted, inject, computed, watch } from "vue"
import { Request } from "@viur/vue-utils"

const props = defineProps({
  name: String,
  module: String,
  tabId: String,
  assistant: String,
  params: Object,
})

const emit = defineEmits(["close", "next"])

const state = reactive({
  result: null,
  currentLang: null,
  rawLang: computed(() => state.currentLang?.split("_")[0]),
  simple: computed(() => state.currentLang?.split("-x-")?.length === 2), //every private space will be validated to simple
  value_de: null,
  loading: false,
  nextlang: computed(() => {
    let val = getValue()
    if (!val) return "de"
    for (const [l, v] of Object.entries(val)) {
      if ((!v || (Array.isArray(v) && (v.length === 0 || !v?.[props.params.index]))) && state.currentLang !== l) {
        return l
      }
    }
    return Object.keys(val).filter((x) => x !== "de")?.[0]
  }),
})
function translate() {
  state.loading = true
  Request.post("/json/assistant/translate", {
    dataObj: {
      text: state.value_de,
      language: state.rawLang,
      characteristic: state.simple ? "simple" : null,
    },
  })
    .then(async (resp) => {
      state.result = await resp.json()
      state.loading = false
    })
    .catch((error) => {
      state.loading = false
    })
}

function getValue(lang = null) {
  let val = props.params.boneState.bonevalue
  if (props.params.index !== null) {
    if (lang) {
      val = val?.[lang]
      val = val?.[props.params.index]
    }
  } else if (lang) {
    val = val?.[lang]
  }
  return val
}

onMounted(() => {
  state.value_de = getValue("de")
  state.currentLang = state.nextlang
  state.result = getValue(state.currentLang)
})

watch(
  () => getValue("de"),
  (newVal, oldVal) => {
    state.value_de = newVal
  }
)

function updateValue(e) {
  state.result = e.target.value
}
function updateValueDe(e) {
  state.value_de = e.target.value
}

function nextlang() {
  emit("next", state.result, state.currentLang)
  state.currentLang = state.nextlang
  state.result = getValue(state.currentLang)
}

function CloseAction() {
  state.result = null
  emit("close")
}

function ApplySelection() {
  emit("close", state.result, state.currentLang)
}
</script>

<style scoped>
.translate-wrapper {
  padding: var(--sl-spacing-large);
  display: flex;
  flex-direction: column;
  gap: var(--sl-spacing-small);
}

.translate-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 3em minmax(0, 1fr);
}

.translate-flex {
  display: flex;
  flex-direction: column;
  gap: var(--sl-spacing-x-small);
}

.translate-icon-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.translate-footer {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 3em minmax(0, 1fr);
}

.translate-small-print {
  font-size: 0.7em;
}

sl-textarea {
  &::part(form-control-label) {
    margin-bottom: var(--sl-spacing-x-small);
    font-weight: 600;
  }
}

.translate-dialog-footer {
  display: flex;
  flex-direction: row;
  gap: var(--sl-spacing-small);
}

.translate-dialog-footer-spacer {
  flex: 1;
}
</style>
