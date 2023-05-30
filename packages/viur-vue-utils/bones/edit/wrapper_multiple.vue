<template>
    <div class="value-line">
      <div class="value">
        <slot></slot>
      </div>
      <sl-button variant="danger"
                 outline
                 @click="$emit('delete')"
                 :title='$t("bone.delete")'
                 class="delete-btn"
      >
        <sl-icon name="x"></sl-icon>
      </sl-button>
    </div>
</template>

<script lang="ts">
import {reactive, defineComponent} from 'vue'

export default defineComponent({
    props: {},
    components: {},
    emits:['change','delete'],
    setup(props, context) {
        const state = reactive({})
        return {state}
    }
})
</script>

<style scoped lang="less">
.value-line{
    display:flex;
    gap:10px;
}

.value{
  width: 100%;
}

.delete-btn{
  &::part(base){
    aspect-ratio: 1;
  }
}
</style>
