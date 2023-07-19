<template>
    <transition>
        <div class="loading" v-if="active" >
            <sl-icon src="/loading.svg" class="loader"></sl-icon>
            <div class="logo">
                <sl-icon :src="logo"></sl-icon>
            </div>
        </div>
    </transition>
</template>

<script>
import {reactive, computed} from 'vue'

// Surroundig div musst have position:relative
export default {
    props: {
        size: {
            type: String,
            default: "2.5"
        },
        active: {
            type: Boolean,
            default: true
        },
        logo:{
            default: "/logo-cube.svg"
        },
        color:{
          default:"var(--sl-color-primary-500)"
        }
    },
    setup(props,context){
        const state =reactive({
            spinnerSize:computed(()=>{
                return `${props.size}rem`
            }),
            logoSize:computed(()=>{
                return `${props.size/1.5}rem`
            }),
            shadowSize:computed(()=>{
                return `0px 0px ${props.size*3}rem ${props.size*3}rem var(--sl-color-neutral-200)`
            })
        })

        return {state}
    }
}
</script>

<style scoped>

.logo{
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    animation: zoom 3.3s ease-in-out 0s infinite alternate;
    & sl-icon{
        height: v-bind("state.logoSize");
        width: v-bind("state.logoSize");
        color:var(--sl-color-neutral-200);
    }
}

@keyframes zoom {
    from {
        scale: 0.5;
    }
    to{
        scale: 1;
    }
}
.loader{
  height: v-bind("state.spinnerSize");
  width: v-bind("state.spinnerSize");
  color: v-bind("color");
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
