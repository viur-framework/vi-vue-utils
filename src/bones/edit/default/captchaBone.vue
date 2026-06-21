<template>
  <div ref="container"></div>
  <input :value="state.token" required class="is-hidden">
</template>

<script setup>
import {reactive, onMounted, inject, ref} from "vue"
import {load} from "recaptcha-v3";

const container = ref(null);
defineOptions({
  inheritAttrs: false,
})
const props = defineProps({
  name: String,
  value: [Object, String, Number, Boolean, Array],
  index: Number,
  lang: String,
  bone: Object,
  autofocus: Boolean,
})

const emit = defineEmits(["change"])

const formState = inject("formState")
const state = reactive({
  recaptchaInstance: null,
  token: null,
})

async function getToken() {
  state.token = await state.recaptchaInstance.execute(props.bone.action)
  emit("change", props.name, state.token, props.lang, props.index)

}

onMounted(async () => {
  const options = {
    useEnterprise: true,
    autoHideBadge: true,
  }
  if (props.bone.render_challenge) {
    options["explicitRenderParameters"] = {
      action: props.bone.action,
      container: container.value,
      callback: (token) => {
        state.token = token
        emit("change", props.name, token, props.lang, props.index, true)
      },
      "expired-callback": () => {
        state.token = null
        emit("change", props.name, null, props.lang, props.index, false)
      },
    }
  }
  state.recaptchaInstance = await load(props.bone.public_key, options)

  if (formState && !props.bone.render_challenge) {
    formState.beforeSend.push(getToken)
  }
  emit("change", props.name, null, props.lang, props.index, false) //init
})

</script>

<style scoped>
.is-hidden {
  display: none;
}
</style>
