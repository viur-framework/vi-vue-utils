<template>
  <template v-if="bone?.params?.actions">
    <template v-if="bone.params.actions.length===1 || true">
      <template v-for="action in bone.params.actions" :key="action['arg']+'_'+name+'_'+lang">
        <sl-button :disabled="disabled(action)"size="medium" variant="info" outline @click="openPopup(action)">
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
  import {reactive, inject, computed} from 'vue'
  import assistantWindow from './assistant/assistantWindow.vue'

  const emit = defineEmits(['change'])

  const props = defineProps( {
    name: String,
    value: [Object, String, Number, Boolean, Array],
    index: Number,
    lang: String,
    bone:Object
  })

  const boneState = inject("boneState")

  const state = reactive({

  })

  function disabled(action){
    if (action["type"] === "assistant"){
      if (action["arg"] === "describe_image"){
        return !props.value?.dest?.key
      }
    }
  }

  function openPopup(action){
    action['_opened']=true
  }

  function closeAssistant(val,lang,action){
    console.log(val)
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
