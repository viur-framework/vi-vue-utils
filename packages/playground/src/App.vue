<template>
    <img alt="Vue logo" src="./assets/logo.png"/>
    <HelloWorld msg="Hello Vue 3 + TypeScript + Vite"/>
    <span>Simple Json Request: {{simpleRequest}}</span>
</template>

<script lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import {Request, ListRequest, destroyStore} from '@viur/viur-vue-utils'
import {ref} from 'vue'

export default {
    components: {HelloWorld},
    setup(props: any, context: any) {

        const simpleRequest = ref() //reactive variable

        //make a request
       // Request.get("https://jsonplaceholder.typicode.com/todos/1").then(async (resp: Response)=>{
       //     simpleRequest.value = await resp.json() //decode and set reactive variable
       // })

        /*Request.get("/x").then(async (resp:Response)=>{
          console.log(await resp.json())
        })*/


        let testList = ListRequest("teststore",{module:"test",renderer:"vi"})
        testList.fetch().then((resp)=>{
          testList.next().then((resp)=>{
            destroyStore(testList)
            testList = ListRequest("teststore",{module:"test"})
          })
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
