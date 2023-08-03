<template>
  <div
    class="image-wrap"
    :class="{'has-popup': 'popup'}"
  >
    <picture v-if="srcset">
      <source
        type="image/webp"
        :srcset="srcset"
      />

      <img
        class="image"
        draggable="false"
        :title="alt ? alt : null"
        :alt="alt ? alt : null"
        :src="state.image"
        @error="onError"
      />
    </picture>

    <img
      v-else
      draggable="false"
      :title="alt ? alt : null"
      :alt="alt ? alt : null"
      :src="state.image"
      class="image"
      @load="updateLoading(false)"
      @click="state.opened = !state.opened"
      @error="onError"
    />
  </div>

  <sl-dialog
    v-if="popup"
    @sl-hide="state.opened = false"
    :open="state.opened"
    :label="$t('preview')"
  >
    <div class="image-wrap">
      <img
        style="display: block"
        draggable="false"
        :title="alt ? alt : null"
        :alt="alt ? alt : null"
        :src="state.image"
        @load="updateLoading(false)"
      />
    </div>
    <sl-button
      :download="alt + '.jpg'"
      :href="src"
      variant="primary"
      target="_blank"
      size="small"
      slot="footer"
      >Download</sl-button
    >
  </sl-dialog>
</template>

<script>
/**
 * Image wrapper mit fallback
 * **/

import { reactive, inject, computed } from "vue"

export default {
  components: {},
  props: {
    src: {
      type: String,
      default: ""
    },
    alt: {
      type: String,
      default: null
    },
    srcset: {
      default: null
    },
    fallback: {
      type: String,
      default: "logo.svg"
    },
    popup: {
      type: Boolean,
      default: false
    }
  },

  setup(props, context) {
    const state = reactive({
      loading: true,
      background: computed(() => {
        /*if(Object.keys(global.state).includes("fallback_image")){
                    return `url(${global.state.fallback_image})`
                }*/
        return ""
      }),
      opened: false,
      image: computed(() => (props.src ? props.src : props.fallback))
    })

    function updateLoading(loading) {
      state.loading = loading
    }

    function onError(e) {
      state.image = props.fallback
    }

    return { updateLoading, state, onError }
  }
}
</script>

<style scoped>
img {
  width: 100%;
  aspect-ratio: 1 / 1;
  object-fit: contain;
  object-position: center;
  background-color: var(--sl-color-neutral-200);
  transition: opacity 2s ease-in-out;
}

img.is-loading {
  filter: blur(4px);
}

.image-wrap{
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-position: center;
  background-image: /* tint image */
                  linear-gradient(to right, rgba(255, 255, 255, 0.87), rgba(255, 255, 255, 0.87)),
                  /* checkered effect */
                  linear-gradient(to right, black 50%, white 50%),
                  linear-gradient(to bottom, black 50%, white 50%);
  background-blend-mode: normal, difference, normal;
  background-size: .65em .65em;
}

.has-popup{
  cursor: pointer;
}

.image {
  width: 100%;
  height: 100%;
  background-image: v-bind("state.background");
  background-repeat: no-repeat;
  background-position: center center;
  background-size: contain;
}
.image:hover {
  object-fit: cover;
}

sl-dialog{
  &::part(panel) {
    width: auto;
    min-width: 350px;
    max-width: 90vw;
  }
  &::part(body) {
    padding: 0;
  }
  &::part(footer) {
    padding: var(--sl-spacing-small);
  }
}

sl-dialog {
  & img {
    width: auto;
  }
}
</style>
