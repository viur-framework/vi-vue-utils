<template>
  <div class="body-wrapper">
    <div style="display:flex;width:100%;justify-content: space-between;gap:1rem;">
      <div style="width: 50%;">Bild:
        <div style="width: 10rem;">
          <vi-image :src="state.url" style="height: 50px"> </vi-image>
        </div>
      </div>

      <div style="width: 50%; display:flex;flex-direction: column;gap:1rem;">
          <sl-tab-group
            v-if="state.value"
            class="lang-tab"
            placement="bottom"
          >
            <template
              v-for="val,lang in state.value"
              :key="lang + '_tab'"
            >
              <sl-tab
                slot="nav"
                :panel="'lang_' + lang"
                @click="state.currentLang = lang"
                :disabled="state.loading"
              >
                {{ $t(lang) }}
              </sl-tab>

              <sl-tab-panel :name="'lang_' + lang">
                Beschreibung ({{lang}}):
                <sl-textarea :value="state.value[lang]" @sl-change="updateValue($event,lang)">
                </sl-textarea>


              </sl-tab-panel>
            </template>
          </sl-tab-group>
        <div>

        </div>
        <sl-input placeholder="weitere Anweisungen" v-model="state.prompt"></sl-input>
        <sl-button @click="describe" size="small" variant="info" :loading="state.loading">Beschreibung erstellen</sl-button>
      </div>
    </div>
    <span style="font-size: var(--sl-font-size-small);font-style: italic;text-align: center">
      Bei der Beschreibung kommt künstliche Intelligenz zum Einsatz. Die Ergebnisse können daher fehlerhaft sein. Bitte prüfen Sie daher stets das Ergebnis.
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

    <sl-button
      variant="success"
      size="small"
      @click="ApplySelection"
    >
      Beschreibung übernehmen
    </sl-button>
  </div>

</template>

<script setup>

import {reactive, defineComponent, onMounted, inject, computed,watch} from "vue"
import { Request } from "@viur/vue-utils"
import viImage from "@viur/vue-utils/generic/Image.vue"

const props = defineProps({
    name: String,
    module: String,
    tabId: String,
    assistant:String,
    params:Object
  })
  const viform = inject('viform')
  const emit = defineEmits(["close",'next'])

    const state = reactive({
      value:null,
      currentLang:null,
      url: computed(()=>(import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : window.location.origin) +props.params.value?.dest?.downloadUrl ),
      prompt:null,
      loading:false
    })
    function describe(){
      state.loading=true
      Request.post("/json/assistant/describe_image",{dataObj:{
         filekey:props.params.value.dest.key,
         context:JSON.stringify(viform?.value?.state?.skel),
         prompt:state.prompt,
         language:state.currentLang
      }}).then(async (resp)=>{

        state.value[state.currentLang] = await resp.json()
        state.loading= false
      }).catch(error=>{
        state.loading=false
      })
    }

    onMounted(()=>{
      state.value = props.params.value?.rel?.alt
      if (!state.value){
        let langs = {}
        for(const l of props.params.bone.using.alt.languages){
          langs[l] = ""
        }
        state.value = langs
      }
      state.currentLang = props.params.bone.using.alt.languages[0]
    })

    function updateValue(e,lang){
      state.value[lang] = e.target.value
    }

    function CloseAction() {
      emit("close",props.params.value)
    }

    function ApplySelection() {
      if (!props.params.value.rel){
        props.params.value['rel'] = {"alt":state.value}
      }else{
        props.params.value.rel.alt = state.value
      }
      emit("close", props.params.value)
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


sl-tab-panel::part(base) {
    padding: 0;
  }

  .lang-tab {
    --track-width: 0;
    --indicator-color: var(--vi-background-color);
    --track-color: var(--vi-border-color);

    &::part(body) {
      padding-bottom: var(--sl-spacing-x-small);
      overflow-x: hidden;
    }

    &::part(tabs) {
      border-top: 1px solid var(--vi-border-color);
    }

    & sl-tab {
      margin-top: -1px;

      &[aria-selected="true"] {
        z-index: 1;

        &::part(base) {
          background-color: var(--vi-background-color);
          border: 1px solid var(--vi-border-color);
          border-top: 1px solid var(--vi-background-color) !important;
          border-bottom: 2px solid var(--sl-color-primary-500) !important;
        }
      }

      &::part(base) {
        background-color: var(--sl-color-neutral-200);
        border: 1px solid var(--sl-color-neutral-400);
        border-top: 1px solid var(--vi-border-color);
        border-radius: 0;
        padding: var(--sl-spacing-x-small);
        transition: all ease 0.3s;
      }

      &:hover {
        &::part(base) {
          background-color: var(--vi-background-color);
          border: 1px solid var(--vi-border-color);
        }
      }

      &:first-child {
        &::part(base) {
          border-bottom-left-radius: 5px;
        }
      }

      &:nth-last-child(2) {
        &::part(base) {
          border-bottom-right-radius: 5px;
        }
      }

      &:not(:first-child) {
        &::part(base) {
          margin-left: -1px;
        }
      }
    }
  }
</style>
