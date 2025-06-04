<template>
  <div class="translate-wrapper">
    <div class="translate-grid">
      <div class="translate-flex">
        <sl-textarea
              :value="state.value_de"
              label="Original Sprache (de):"
              @sl-change="updateValueDe">
        </sl-textarea>
      </div>

      <div class="translate-icon-wrap">
        <sl-icon name="arrow-left-right"></sl-icon>
      </div>

      <div class="translate-flex">
        <sl-textarea
              :value="state.result || '-'"
              :label="`Zielsprache (` + state.currentLang + `):`"
              @sl-change="updateValue">
        </sl-textarea>
      </div>
    </div>
    <div class="translate-footer">

      <span class="translate-small-print">
        * Bei der Übersetzung kommt Künstliche Intelligenz zum Einsatz, die Ergebnisse können fehlerhaft sein. Bitte prüfen Sie stehts das Ergebnis.
      </span>
      <div></div>
      <sl-button @click="translate" size="small" variant="info">
        Übersetzen
      </sl-button>

    </div>
  </div>

  <div
    slot="footer"
    class="translate-dialog-footer"
  >
    <sl-button
      variant="danger"
      size="small"
      outline
      @click="CloseAction"
      >{{ $t("relation.abort") }}
    </sl-button>

    <div class="translate-dialog-footer-spacer"></div>

    <sl-button variant="success" outline @click="nextlang" size="small":disabled="!state.nextlang">
      Übernehmen und nächste leere Sprache
    </sl-button>

    <sl-button
      variant="success"
      size="small"
      @click="ApplySelection"
    >
      Ziel für {{state.currentLang}} übernehmen
    </sl-button>
  </div>

</template>

<script setup>

import {reactive, defineComponent, onMounted, inject, computed,watch} from "vue"
import { Request } from "@viur/vue-utils"

const props = defineProps({
    name: String,
    module: String,
    tabId: String,
    assistant:String,
    params:Object
  })

  const emit = defineEmits(["close",'next'])

    const state = reactive({
      result: null,
      currentLang:null,
      rawLang: computed(()=>state.currentLang?.split("_")[0]),
      simple: computed(()=>state.currentLang?.split("_")?.length===2),
      value_de:null,
      loading:false,
      nextlang: computed(()=>{
        for (const [l,v] of Object.entries(props.params.boneState.bonevalue)){
          if (!v && state.currentLang!==l) {
            return l
          }
        }
        return Object.keys(props.params.boneState.bonevalue).filter(x=>x!=='de')?.[0]
      })
    })
    function translate(){
      state.loading=true
      Request.get("/json/assistant/translate",{dataObj:{
        text:state.value_de,
        language:state.rawLang,
        simplified:state.simple
      }}).then(async (resp)=>{
        state.result = await resp.text()
        state.loading = false
      }).catch(error=>{
        state.loading = false
      })
    }

    onMounted(()=>{
      state.value_de = props.params.boneState.bonevalue?.['de']
      state.currentLang = state.nextlang
      state.result = props.params.boneState.bonevalue?.[state.currentLang]
    })

    watch(()=>props.params.boneState.bonevalue?.['de'],(newVal,oldVal)=>{
      state.value_de = newVal
    })

    function updateValue(e){
      state.result = e.target.value
    }
    function updateValueDe(e){
      state.value_de = e.target.value
    }


    function nextlang(){
      emit("next", state.result, state.currentLang)
      state.currentLang = state.nextlang
      state.result = props.params.boneState.bonevalue?.[state.currentLang]
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

.translate-wrapper{
  padding: var(--sl-spacing-large);
  display:flex;
  flex-direction: column;
  gap: var(--sl-spacing-small);
}

.translate-grid{
  display: grid;
  grid-template-columns: minmax(0, 1fr) 3em minmax(0, 1fr);
}

.translate-flex{
  display: flex;
  flex-direction: column;
  gap: var(--sl-spacing-x-small);
}

.translate-icon-wrap{
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.translate-footer{
  display: grid;
  grid-template-columns: minmax(0, 1fr) 3em minmax(0, 1fr);
}

.translate-small-print{
  font-size: .7em;
}

sl-textarea{
  &::part(form-control-label){
    margin-bottom: var(--sl-spacing-x-small);
    font-weight: 600;
  }
}

.translate-dialog-footer{
  display: flex;
  flex-direction: row;
  gap: var(--sl-spacing-small)
}

.translate-dialog-footer-spacer{
  flex: 1;
}
</style>
