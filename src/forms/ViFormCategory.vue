<template>
  <template v-if="hide">
    <slot></slot>
  </template>

  <sl-details
    class="viform-category"
    :class="([`viform-category-${encodeURI(name.toLowerCase())}`])"
    v-else
    v-show="visible"
    :summary="name"
    :open="open"
  >
    <slot></slot>
  </sl-details>

</template>

<script setup>
const props = defineProps({
  // String shown a Category
  name:{
    type:String,
    required:true
  },
  // internal identifiert mostly lowerCased name
  identifier:{
    type:String,
    required:true
  },
  //is hidden
  visible:{
    type:Boolean,
    default:true
  },
  //is open
  open:{
    type:Boolean,
    default:true
  },
  //hide wrapper
  hide:{
    type:Boolean,
    default:false
  }

})
</script>

<style scoped>
sl-details {
  &::part(prefix) {
    display: none;
  }

  &::part(base) {
    border-radius: 0;
    border-left: none;
    border-right: none;
    border-top: none;
    border-bottom: solid 1px var(--sl-color-neutral-300);
  }

  &::part(summary) {
    font-weight: 700;
  }
}
</style>
