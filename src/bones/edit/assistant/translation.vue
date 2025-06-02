<template>
  <div class="body-wrapper">
    <div style="display:flex;width:100%;justify-content: space-between;gap:10px;">
      <div style="width: 50%">Original(de):
        <sl-textarea :value="state.value_de" @sl-change="updateValueDe">
        </sl-textarea>
      </div>

      <div style="width: 50%">Ziel({{state.currentLang}}):
        <sl-textarea :value="state.result || '-'" @sl-change="updateValue">
        </sl-textarea>
        <sl-button @click="translate" size="small" variant="info">Übersetzen</sl-button>
      </div>
    </div>
    <span style="font-size: var(--sl-font-size-small);font-style: italic;text-align: center">
      Bei der Übersetzung kommt künstliche Intelligenz zum Einsatz. Die Ergebnisse können daher fehlerhaft sein. Bitte prüfen Sie daher stets das Ergebnis.
    </span>
  </div>

  <div
    slot="footer"
    class="footer"
  >
    <sl-button
      variant="danger"
      size="small"
      outline
      @click="CloseAction"
      >{{ $t("relation.abort") }}</sl-button
    >
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
.relation-popup {
  &::part(base) {
    position: absolute;
    height: 100%;
  }

  &::part(panel) {

    margin-bottom: 40px;
  }

  &::part(body) {
    display: contents;
    padding:20px;
  }

  &::part(footer) {
    padding: var(--sl-spacing-small);
  }

  &::part(overlay) {
    position: absolute;
  }

  &:deep(.bar sl-button[variant="success"]) {
    &::part(base) {
      background-color: transparent;
      border: 1px solid var(--sl-color-success-500);
      aspect-ratio: 1;
      padding: 0;
    }

    &::part(label) {
      display: none;
    }

    &::part(prefix) {
      color: var(--sl-color-success-500);
    }
  }
}

.footer {
  display: flex;
  justify-content: space-between;
}

.body-wrapper{
  padding:20px 20px 0 20px;
  display:flex;
  flex-direction: column;
  gap:20px;
}
</style>
