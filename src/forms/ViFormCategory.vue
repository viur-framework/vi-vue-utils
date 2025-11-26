<template>
  <template v-if="hide">
    <slot></slot>
  </template>

  <sl-details
    v-else
    v-show="visible"
    class="viform-category"
    :class="[`viform-category-${encodeURI(name.toLowerCase())}`]"
    :summary="setCategoryName()"
    :open="open"
  >
    <slot></slot>
  </sl-details>
</template>

<script setup>
const props = defineProps({
  // String shown a Category
  name: {
    type: String,
    required: true,
  },
  // internal identifiert mostly lowerCased name
  identifier: {
    type: String,
    required: true,
  },
  //is hidden
  visible: {
    type: Boolean,
    default: true,
  },
  //is open
  open: {
    type: Boolean,
    default: true,
  },
  //hide wrapper
  hide: {
    type: Boolean,
    default: false,
  },
})

const setCategoryName = () => {
  return props.name ? props.name.replace(/<[^>]*>/g, '') : props.name
}
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
