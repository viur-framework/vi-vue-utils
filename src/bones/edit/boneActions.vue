<template>
  <template v-if="bone?.params?.actions">
    <template v-if="bone.params.actions.length===1">
      <template v-for="action in state.actions" :key="action['arg']+'_'+name+'_'+lang">
        <sl-button :disabled="disabled(action)"
                size="medium"
                variant="info"
                outline
                :title="action['title']"
                @click="openPopup(action)">
          <sl-icon :name="action['icon']" slot="prefix"></sl-icon>
        </sl-button>

        <assistant-window
          :open="action['_opened']"
          :name="bone['descr']"
          :module="bone?.['module']"
          :action="action"
          :params="{name, value, index, lang, bone,boneState}"
          @close="closeAssistant"
          @next="nextAssistant"
        >
        </assistant-window>
      </template>
    </template>

  </template>

</template>

<script setup>
  import {reactive, inject, computed, onMounted} from 'vue'
  import assistantWindow from './assistant/assistantWindow.vue'

  const emit = defineEmits(['change'])

  const defaultActions={
    "translate":{
            "type":"assistant",
            "arg":"translate",
            "name":"Übersetzen",
            "icon":"translate",
            "library":"default",
            "title":"Übersetzen"
    },
    "describe_image":{
            "type":"assistant",
            "arg":"describe_image",
            "name":"Bildbeschreibung erstellen",
            "icon":"file-richtext",
            "library":"default",
            "title":"Bild beschreiben"
        }
  }

  const props = defineProps( {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    bone:Object
  })

  const boneState = inject("boneState")

  const state = reactive({
    actions:[]
  })

  function disabled(action){
    if (action["type"] === "assistant"){
      if (action["arg"] === "describe_image"){
        return !props.value?.dest?.key
      }
      if (action["arg"] === "translate"){
        return !props.bone.languages
      }
    }
  }

  function collectActions(){
      let data = []
      if (!props?.bone?.params?.actions) return data
      for(const entry of props.bone.params.actions){
        if (Object.keys(defaultActions).includes(entry)){
          data.push(defaultActions[entry])
        }else{
          data.push(entry)
        }
      }
      return data
  }

  onMounted(()=>{
    state.actions = collectActions()
  })

  function openPopup(action){
    action['_opened']=true
  }

  function closeAssistant(val,lang,action){
    action['_opened']=false
    if(val){
      emit("change", props.name, val, lang, props.index)
    }
  }
  function nextAssistant(val,lang,action){
    if(val){
      emit("change", props.name, val, lang, props.index)
    }
  }


</script>
