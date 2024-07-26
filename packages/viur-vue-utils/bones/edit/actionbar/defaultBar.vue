<template>
  <div class="actionbar">
    <sl-button
      v-if="boneState.multiple && !readonly"
      variant="danger"
      :title="$t('bone.delAll')"
      outline
      class="delete-btn"
      @click="handleRemove(lang)"
    >
      {{ $t('bone.delAll') }}
    </sl-button>

    <sl-button
      v-if="boneState.multiple && !readonly"
      variant="success"
      :title="$t('bone.add')"
      outline
      class="add-btn"
      @click="handleAdd(lang)"
    >
      <sl-icon
        slot="prefix"
        name="plus-lg"
      ></sl-icon>
      {{ $t("bone.add") }}
      <template v-if="state.counter > 1">({{ state.counter }})</template>
    </sl-button>
  </div>
</template>

<script lang="ts">
//@ts-nocheck
import { reactive, defineComponent, onMounted, inject } from "vue"

export default defineComponent({
  props: {
    name: String,
    value: Object,
    index: Number,
    lang: String,
    readonly: Boolean,
    params: Object
  },
  components: {},
  emits: ["change"],
  setup(props, context) {
    const boneState = inject("boneState")
    const state = reactive({
      counter: 0,
      debounce: null
    })
    const addMultipleEntry = inject("addMultipleEntry")
    const removeMultipleEntries = inject("removeMultipleEntries")

    function handleAdd() {
      state.counter += 1
      let delay = 200
      if (state.counter > 1) {
        delay = 500
      }
      if (state.debounce) {
        clearTimeout(state.debounce)
      }
      state.debounce = setTimeout(() => {
        for (let i = state.counter; i--; ) {
          addMultipleEntry(props.lang)
        }
        state.counter = 0
      }, delay)
    }

    function handleRemove() {
      let delay = 200
      if (state.debounce) {
        clearTimeout(state.debounce)
      }
      state.debounce = setTimeout(() => {
        removeMultipleEntries(props.lang)
      }, delay)
    }

    onMounted(() => {
      if (!props.value || props.value.length === 0) {
        context.emit("change", props.name, [], props.lang) //init
      }
    })

    return {
      state,
      boneState,
      handleAdd,
      handleRemove,
      removeMultipleEntries
    }
  }
})
</script>

<style scoped>
.actionbar {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
}

.add-btn {
  margin-left: auto;
}

.delete-btn{

  &:hover{
    &::part(base){
      border: none;
      background-color: transparent;
      color: var(--sl-color-danger-500)
    }

     &::part(label){
      text-decoration: underline;
    }
   }


  &::part(base){
    border: none;
   }

   &::part(label){
    padding: 0;
    }
}
</style>
