<template>
  <transition>
    <div
      v-if="active"
      class="loading"
    >
      <sl-spinner
        class="loader"
      ></sl-spinner>
      <div class="logo">
        <sl-icon :src="logo" class="logo-color"></sl-icon>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { reactive, computed } from "vue"


// Surroundig div musst have position:relative
  const props = defineProps( {
    size: {
      type: String,
      default: "2"
    },
    active: {
      type: Boolean,
      default: true
    },
    logo: {
      default: "logo-cube.svg",
      type: String
    },
    color: {
      default: "var(--sl-color-primary-500)",
      type: String
    }
  })
    const state = reactive({
      trackWidth: computed(() => {
        return `${props.size / 30}rem`
      }),
      outerSize: computed(() => {
        return `calc(${props.size}rem + ${state.trackWidth})`
      }),
      spinnerSize: computed(() => {
        return `${props.size}rem`
      }),
      logoSize: computed(() => {
        return `calc(${props.size}rem - ${state.trackWidth} * 10)`
      }),
      shadow: computed(() => {
        return `0px 0px ${props.size / 6}rem 0 color-mix(in hsl, var(--sl-color-neutral-1000), 80% transparent)`
      })
    })

</script>

<style scoped>
.logo {
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  height: v-bind("state.outerSize");
  width: v-bind("state.outerSize");
  overflow: hidden;
  border-radius: 50%;
  background-color: var(--sl-color-neutral-0);
  box-shadow: v-bind("state.shadow");

  & sl-icon {
    height: v-bind("state.logoSize");
    width: v-bind("state.logoSize");
    aspect-ratio: 1;
    animation: zoom 3.3s ease-in-out 0s infinite alternate;
  }
}

@keyframes zoom {
  from {
    scale: 0.75;
  }
  to {
    scale: 1;
  }
}
.loader {
  font-size: v-bind("state.spinnerSize");
  --indicator-color: v-bind("color");
  --track-color: var(--sl-color-neutral-0);
  --track-width: v-bind("state.trackWidth");
  z-index: 1;
}

.loading {
  position: absolute;
  width: 100%;
  height: 100%;
  display: inline-grid;
  justify-items: center;
  align-items: center;
}
/* transition styles see: https://vuejs.org/guide/built-ins/transition.html#the-transition-component */
.v-enter-active,
.v-leave-active {
  transition: opacity 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}


</style>
