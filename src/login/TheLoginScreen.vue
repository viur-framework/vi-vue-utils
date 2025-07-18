<template>
  <component :is="LoginScreen37"></component>
</template>
<script setup>
import LoginScreen37 from "./OldLogin/TheLoginScreen.vue";
import LoginScreen from "./Loginscreen/TheLoginScreen.vue";
import {onBeforeMount} from "vue";
import {Request} from "../utils/request"

onBeforeMount(()=>{
  Request.get("/")
})


</script>