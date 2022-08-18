<template>
    <img alt="Vue logo" src="./assets/logo.png"/>
    <HelloWorld msg="Hello Vue 3 + TypeScript + Vite"/>
    <span>Simple Json Request: {{simpleRequest}}</span>
</template>

<script lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import {Request} from 'viur-vue-utils'
import {ref} from 'vue'

export default {
    components: {HelloWorld},
    setup() {

        const simpleRequest = ref() //reactive variable

        //make a request
        Request.get("https://dummyjson.com/products/1").then(async (resp)=>{
            simpleRequest.value = await resp.json() //decode and set reactive variable
        })

        return {
            simpleRequest //expose to template
        }
    }
}

</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
